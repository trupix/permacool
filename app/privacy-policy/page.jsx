import { buildPublicPageMetadata } from "../../lib/site";

export const metadata = buildPublicPageMetadata({
  path: "/privacy-policy",
  title: "Privacy Policy | Perma Cool",
  description: "Privacy Policy for Perma Cool website visitors and inquiry submissions."
});

export default function PrivacyPolicyPage() {
  return (
    <main className="container section">
      <p className="eyebrow">Legal</p>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> March 2026</p>

      <div className="card mt">
        <h3>Information we collect</h3>
        <p>
          We may collect contact and business information you provide through forms, phone calls, or email,
          such as your name, email address, company name, phone number, and project details.
        </p>
      </div>

      <div className="card mt">
        <h3>How we use information</h3>
        <ul className="list">
          <li>Respond to quote requests and support inquiries</li>
          <li>Provide product and engineering-fit recommendations</li>
          <li>Improve website performance and user experience</li>
          <li>Communicate about relevant Perma Cool Systems Inc. services</li>
        </ul>
      </div>

      <div className="card mt">
        <h3>Sharing and disclosure</h3>
        <p>
          We do not sell your personal information. We may share limited data with trusted service providers
          that help us operate our website and business systems, subject to appropriate safeguards.
        </p>
      </div>

      <div className="card mt">
        <h3>Data retention</h3>
        <p>
          We retain information for as long as needed to fulfill the purposes described above,
          comply with legal obligations, and resolve disputes.
        </p>
      </div>

      <div className="card mt">
        <h3>Your choices</h3>
        <p>
          You can request to access, correct, or delete your personal information by contacting us.
          You may also opt out of non-essential communications.
        </p>
      </div>

      <div className="card mt">
        <h3>Contact</h3>
        <p>
          For privacy questions, contact Perma Cool Systems Inc. at <a href="/contact-us">/contact-us</a> or call
          <a href="tel:+17472081001"> 747.208.1001</a>.
        </p>
      </div>
    </main>
  );
}
