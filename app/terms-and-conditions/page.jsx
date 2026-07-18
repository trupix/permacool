import { buildPublicPageMetadata } from "../../lib/site";

export const metadata = buildPublicPageMetadata({
  path: "/terms-and-conditions",
  title: "Terms & Conditions | Perma Cool",
  description: "Terms and Conditions for use of the Perma Cool website and inquiry services."
});

export default function TermsPage() {
  return (
    <main className="container section">
      <p className="eyebrow">Legal</p>
      <h1>Terms &amp; Conditions</h1>
      <p><strong>Last updated:</strong> March 2026</p>

      <div className="card mt">
        <h3>Website use</h3>
        <p>
          By using this website, you agree to use it for lawful purposes only and in a manner that does not
          infringe the rights of others or restrict their use of the site.
        </p>
      </div>

      <div className="card mt">
        <h3>Information accuracy</h3>
        <p>
          Content on this site is provided for general informational purposes and may change without notice.
          Final specifications, pricing, and delivery terms are confirmed through formal quote and agreement.
        </p>
      </div>

      <div className="card mt">
        <h3>Quotes and orders</h3>
        <p>
          Any inquiry or quote request does not create a binding obligation. Binding terms are established only
          in executed sales documents or contracts.
        </p>
      </div>

      <div className="card mt">
        <h3>Intellectual property</h3>
        <p>
          Website content, branding, and materials are owned by Perma Cool Systems Inc. or its licensors and may not be
          reproduced without permission.
        </p>
      </div>

      <div className="card mt">
        <h3>Limitation of liability</h3>
        <p>
          To the maximum extent permitted by law, Perma Cool Systems Inc. is not liable for indirect or consequential damages
          arising from website use.
        </p>
      </div>

      <div className="card mt">
        <h3>Contact</h3>
        <p>
          Questions about these terms can be submitted via <a href="/contact-us">/contact-us</a> or by calling
          <a href="tel:+17472081001"> 747.208.1001</a>.
        </p>
      </div>
    </main>
  );
}
