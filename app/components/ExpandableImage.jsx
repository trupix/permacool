"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft } from "lucide-react";
import "./expandable-image.css";

export default function ExpandableImage({ src, alt, label, className = "", children }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <button ref={triggerRef} type="button" className={`expandable-image-trigger ${className}`}
        aria-label={label} aria-haspopup="dialog" onClick={() => setOpen(true)}>
        {children}
      </button>
      {open && createPortal(
        <dialog ref={dialogRef} className="equipment-image-viewer" aria-label="Expanded equipment image"
          onClose={() => setOpen(false)}
          onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current.close(); }}>
          <div className="equipment-image-viewer-toolbar">
            <button type="button" autoFocus onClick={() => dialogRef.current.close()}>
              <ArrowLeft size={20} aria-hidden="true" /> Back to page
            </button>
          </div>
          {/* Full source image keeps diagrams sharp without navigating away. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} />
        </dialog>, document.body
      )}
    </>
  );
}
