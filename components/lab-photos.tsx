"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { parseNameplate, type LabPhoto } from "@/lib/lab-nameplate";
import type { LabAsset } from "@/lib/lab-catalog";
import type { Worker } from "tesseract.js";

export function LabPhotos({
  asset,
  canEdit,
  onApply,
}: {
  asset: LabAsset;
  canEdit: boolean;
  onApply: (model: string, serial: string, photo: LabPhoto) => Promise<boolean>;
}) {
  const [photos, setPhotos] = useState<LabPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [review, setReview] = useState<{
    photo: LabPhoto;
    text: string;
    model: string;
    serial: string;
  } | null>(null);
  const worker = useRef<Worker | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const abort = new AbortController();
    fetch(`/api/lab/photos?assetId=${encodeURIComponent(asset.id)}`, {
      signal: abort.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw Error(result.error);
        setPhotos(result.photos);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setNotice(error.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => {
      mounted.current = false;
      abort.abort();
      void worker.current?.terminate();
      worker.current = null;
    };
  }, [asset.id]);
  async function readNameplate(photo: LabPhoto) {
    setReading(true);
    setReview(null);
    setNotice("Preparing nameplate reader…");
    let current: Worker | null = null;
    try {
      const { createWorker } = await import("tesseract.js");
      current = await createWorker("eng", 1, {
        workerPath: "/lab-ocr/worker.min.js",
        corePath: "/lab-ocr",
        langPath: "/lab-ocr",
        workerBlobURL: false,
        logger: (message) => {
          if (mounted.current)
            setNotice(
              message.status === "recognizing text"
                ? `Reading nameplate… ${Math.round(message.progress * 100)}%`
                : "Preparing nameplate reader…",
            );
        },
      });
      if (!mounted.current) {
        await current.terminate();
        return;
      }
      worker.current = current;
      const response = await fetch(`/api/lab/photos/${photo.id}`);
      if (!response.ok) throw Error("Photo could not be loaded.");
      const { data } = await current.recognize(await response.blob());
      if (!mounted.current) return;
      setReview({ photo, text: data.text, ...parseNameplate(data.text) });
      setNotice(
        "Check the suggestions against the photo before applying. Blank fields leave existing values unchanged.",
      );
    } catch {
      if (mounted.current) {
        setReview({ photo, text: "", model: "", serial: "" });
        setNotice(
          "Automatic reading could not finish. You can still transcribe the model and serial from the saved photo.",
        );
      }
    } finally {
      if (worker.current === current) worker.current = null;
      await current?.terminate().catch(() => {});
      if (mounted.current) setReading(false);
    }
  }
  async function upload(
    event: FormEvent<HTMLFormElement>,
    kind: "nameplate" | "additional",
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("kind", kind);
    data.set("assetId", asset.id);
    setUploading(true);
    setNotice("Saving photo…");
    try {
      const file = data.get("file");
      if (!(file instanceof File) || file.size > 3_000_000)
        throw Error("Choose a JPG, PNG or WebP photo under 3 MB.");
      const response = await fetch("/api/lab/photos", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      if (!mounted.current) return;
      setPhotos((current) => [result.photo, ...current]);
      form.reset();
      setNotice("Photo saved.");
      if (kind === "nameplate") await readNameplate(result.photo);
    } catch (error) {
      if (mounted.current)
        setNotice(
          error instanceof Error ? error.message : "Photo upload failed.",
        );
    } finally {
      if (mounted.current) setUploading(false);
    }
  }
  const busy = reading || uploading || saving;
  function uploadForm(kind: "nameplate" | "additional") {
    return (
      canEdit && (
        <form
          className="lab-photo-upload"
          onSubmit={(event) => void upload(event, kind)}
        >
          <label>
            {kind === "nameplate" ? "Nameplate photo" : "Additional photo"}
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              disabled={busy}
            />
          </label>
          <label>
            Photo caption
            <input
              name="caption"
              maxLength={300}
              placeholder={
                kind === "nameplate"
                  ? "e.g. Main equipment nameplate"
                  : "e.g. Door gasket, controller, overall view"
              }
              disabled={busy}
            />
          </label>
          <button className="lab-primary" disabled={busy}>
            {kind === "nameplate" ? "Upload & read nameplate" : "Upload photo"}
          </button>
        </form>
      )
    );
  }
  function photoCard(photo: LabPhoto) {
    return (
      <figure key={photo.id} className="lab-photo-card">
        <a
          href={`/api/lab/photos/${photo.id}`}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={`/api/lab/photos/${photo.id}`}
            alt={
              photo.caption ||
              `${asset.name} ${photo.kind === "nameplate" ? "nameplate" : "equipment photo"}`
            }
            loading="lazy"
          />
        </a>
        <figcaption>
          {photo.caption ||
            (photo.kind === "nameplate" ? "Nameplate" : "Equipment photo")}
          <small>
            {new Date(photo.createdAt).toLocaleDateString("en-US", {
              timeZone: "America/Los_Angeles",
            })}{" "}
            · {photo.author}
          </small>
        </figcaption>
        {photo.kind === "nameplate" && canEdit && (
          <button disabled={busy} onClick={() => void readNameplate(photo)}>
            Read model & serial
          </button>
        )}
      </figure>
    );
  }
  return (
    <div className="lab-photo-section">
      <section>
        <h3>Nameplate</h3>
        <p>
          Keep a clear, straight-on photo of the identification plate. Model and
          serial suggestions are reviewed before updating this record.
        </p>
        <div className="lab-current-identity">
          <span>
            Current model<strong>{asset.model || "Not recorded"}</strong>
          </span>
          <span>
            Current serial<strong>{asset.serial || "Not recorded"}</strong>
          </span>
        </div>
        {uploadForm("nameplate")}
        {loading ? (
          <p>Loading photos…</p>
        ) : !photos.some((photo) => photo.kind === "nameplate") ? (
          <div className="lab-empty">No nameplate photo yet.</div>
        ) : (
          <div className="lab-photo-grid">
            {photos
              .filter((photo) => photo.kind === "nameplate")
              .map(photoCard)}
          </div>
        )}
      </section>
      <div role="status" aria-live="polite" className="lab-photo-status">
        {notice}
      </div>
      {review && (
        <form
          className="lab-nameplate-review"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            try {
              const ok = await onApply(
                review.model.trim(),
                review.serial.trim(),
                review.photo,
              );
              if (ok) {
                setReview(null);
                setNotice(
                  "Model and serial changes saved to the equipment record.",
                );
              } else
                setNotice(
                  "Could not apply changes. Your review is still here; check the save message below.",
                );
            } finally {
              setSaving(false);
            }
          }}
        >
          <h3>Review nameplate details</h3>
          <img
            className="lab-review-image"
            src={`/api/lab/photos/${review.photo.id}`}
            alt="Nameplate being reviewed"
          />
          <label>
            Model number
            <input
              value={review.model}
              onChange={(event) =>
                setReview({ ...review, model: event.target.value })
              }
              maxLength={100}
              placeholder="Type the model if not detected"
            />
          </label>
          <label>
            Serial number
            <input
              value={review.serial}
              onChange={(event) =>
                setReview({ ...review, serial: event.target.value })
              }
              maxLength={100}
              placeholder="Type the serial if not detected"
            />
          </label>
          <p>
            Current: {asset.model || "no model"} / {asset.serial || "no serial"}
            . Only nonblank fields above will replace these values.
          </p>
          <details>
            <summary>Text read from nameplate</summary>
            <pre>{review.text || "No readable text was found."}</pre>
          </details>
          <div className="lab-actions">
            <button
              type="button"
              disabled={busy}
              onClick={() => setReview(null)}
            >
              Cancel review
            </button>
            <button
              className="lab-primary"
              disabled={busy || (!review.model.trim() && !review.serial.trim())}
            >
              Confirm & apply to equipment
            </button>
          </div>
        </form>
      )}
      <section className="lab-additional-photos">
        <h3>Additional pictures</h3>
        <p>
          Overall equipment, controls, components, and before-and-after service
          photos.
        </p>
        {uploadForm("additional")}
        <div className="lab-photo-grid">
          {photos.filter((photo) => photo.kind === "additional").map(photoCard)}
        </div>
        {!loading && !photos.some((photo) => photo.kind === "additional") && (
          <div className="lab-empty">No additional pictures yet.</div>
        )}
      </section>
    </div>
  );
}
