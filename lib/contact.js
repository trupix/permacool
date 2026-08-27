export const CONTACT_INTERESTS = ["Ethanol Chillers", "Butane Recovery Systems", "Both"];

export const CONTACT_COOLING_METHODS = ["LN2", "Direct Refrigerant", "Hybrid", "Other"];

export const CONTACT_REQUEST_TYPES = [
  "Quote",
  "System Recommendation",
  "Product Pricing",
  "System Fit Review",
  "Transition Plan",
  "Service Guidance",
  "Design Call",
  "Cost Comparison",
  "General Consultation"
];

export const CONTACT_PRODUCTS = ["BLAST 60/45", "BLAST 150/45", "BLAST 240/45", "Butane Recovery System"];

const FIELD_LIMITS = {
  name: 100,
  email: 254,
  company: 160,
  phone: 40,
  target_temp: 60,
  throughput: 120,
  message: 4000,
  source: 120
};

export function buildContactHref({ interest, coolingMethod, requestType, product, source } = {}) {
  const params = new URLSearchParams();

  if (CONTACT_INTERESTS.includes(interest)) params.set("interest", interest);
  if (CONTACT_COOLING_METHODS.includes(coolingMethod)) params.set("cooling_method", coolingMethod);
  if (CONTACT_REQUEST_TYPES.includes(requestType)) params.set("request_type", requestType);
  if (CONTACT_PRODUCTS.includes(product)) params.set("product", product);
  if (source) params.set("source", normalizeContactField(source, FIELD_LIMITS.source));

  const query = params.toString();
  return query ? `/contact-us?${query}` : "/contact-us";
}

export function buildContactSubmissionAction({ requestType, product, source } = {}) {
  const params = new URLSearchParams();

  if (CONTACT_REQUEST_TYPES.includes(requestType)) params.set("request_type", requestType);
  if (CONTACT_PRODUCTS.includes(product)) params.set("product", product);
  if (source) params.set("source", normalizeContactField(source, FIELD_LIMITS.source));

  const query = params.toString();
  return query ? `/api/contact?${query}` : "/api/contact";
}

export function firstContactParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

export function allowedContactValue(value, allowedValues, fallback = "") {
  const candidate = normalizeContactField(firstContactParam(value), 160);
  return allowedValues.includes(candidate) ? candidate : fallback;
}

export function normalizeContactField(value, maxLength = 500) {
  return String(value ?? "")
    .replace(/\0/g, "")
    .trim()
    .slice(0, maxLength);
}

function normalizeContactSingleLine(value, maxLength) {
  return normalizeContactField(value, maxLength).replace(/\s+/g, " ");
}

export function normalizeContactPayload(formData) {
  return {
    name: normalizeContactSingleLine(formData.get("name"), FIELD_LIMITS.name),
    email: normalizeContactSingleLine(formData.get("email"), FIELD_LIMITS.email).toLowerCase(),
    company: normalizeContactSingleLine(formData.get("company"), FIELD_LIMITS.company),
    phone: normalizeContactSingleLine(formData.get("phone"), FIELD_LIMITS.phone),
    interest: allowedContactValue(formData.get("interest"), CONTACT_INTERESTS),
    cooling_method: allowedContactValue(formData.get("cooling_method"), CONTACT_COOLING_METHODS),
    target_temp: normalizeContactSingleLine(formData.get("target_temp"), FIELD_LIMITS.target_temp),
    throughput: normalizeContactSingleLine(formData.get("throughput"), FIELD_LIMITS.throughput),
    message: normalizeContactField(formData.get("message"), FIELD_LIMITS.message),
    request_type: allowedContactValue(formData.get("request_type"), CONTACT_REQUEST_TYPES, "Quote"),
    product: allowedContactValue(formData.get("product"), CONTACT_PRODUCTS),
    source: normalizeContactSingleLine(formData.get("source"), FIELD_LIMITS.source),
    website: normalizeContactSingleLine(formData.get("website"), 200)
  };
}

export function isValidContactEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[\r\n]/.test(value);
}

export function escapeContactHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function contactIntentCopy({ requestType, product }) {
  const label = product || requestType;

  return {
    eyebrow: requestType || "Request a Quote",
    formTitle: label ? `${label} inquiry` : "Contact Perma Cool",
    buttonLabel:
      requestType === "System Recommendation"
        ? "Request My Recommendation"
        : requestType === "System Fit Review"
          ? "Request My Fit Review"
          : requestType === "Transition Plan"
            ? "Request My Transition Plan"
            : requestType === "Service Guidance"
              ? "Request Service Guidance"
              : requestType === "Design Call"
                ? "Request a Design Call"
                : requestType === "Cost Comparison"
                  ? "Request My Cost Comparison"
                  : requestType === "Product Pricing"
                    ? "Request Product Pricing"
                    : "Get My Quote"
  };
}
