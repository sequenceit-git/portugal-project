import Footer from "../components/Footer";
import SEO from "../components/SEO";

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-sm sm:text-base text-gray-600 leading-relaxed space-y-3">
      {children}
    </div>
  </div>
);

const PrivacyPolicy = () => {
  return (
    <div className="bg-background-light text-gray-800 font-display antialiased">
      <SEO
        title="Privacy Policy | Entertainment Mama – Lisbon Tuk-Tuk Tours"
        description="Read our Privacy Policy to understand how Entertainment Mama collects, uses, and protects your personal data."
      />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 pt-28 sm:pt-32 pb-10 sm:pb-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-primary font-bold tracking-wider uppercase text-[11px] sm:text-xs">
            Legal
          </span>
          <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500">
            Last updated: 11 March 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Section title="1. Introduction">
          <p>
            Welcome to Entertainment Mama ("we", "us", or "our"). We operate the
            website <strong>tukinlisbon.com</strong> and provide electric
            tuk-tuk tour experiences in Lisbon, Portugal. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your personal
            information when you visit our website or make a booking with us.
          </p>
          <p>
            Please read this policy carefully. By using our services you agree
            to the practices described below. If you disagree, please
            discontinue use of our services.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We may collect the following categories of personal data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Identity & Contact:</strong> name, email address, phone
              number, and country of residence provided during booking or
              contact forms.
            </li>
            <li>
              <strong>Payment Data:</strong> billing details processed securely
              through Stripe. We do not store full card numbers on our servers.
            </li>
            <li>
              <strong>Booking Details:</strong> tour chosen, date, number of
              participants, and any special requests.
            </li>
            <li>
              <strong>Usage Data:</strong> IP address, browser type, pages
              visited, and time spent on site, collected via cookies and
              analytics tools.
            </li>
            <li>
              <strong>Reviews & Feedback:</strong> content you voluntarily
              submit through our feedback form, including photos if provided.
            </li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use the data we collect to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Process and confirm tour bookings and payments.</li>
            <li>
              Send booking confirmations, reminders, and post-tour follow-ups
              via email or WhatsApp.
            </li>
            <li>Respond to inquiries and customer support requests.</li>
            <li>Display approved reviews and testimonials on our website.</li>
            <li>
              Improve website functionality and user experience through
              anonymised analytics.
            </li>
            <li>Comply with legal obligations under Portuguese and EU law.</li>
          </ul>
        </Section>

        <Section title="4. Legal Basis for Processing (GDPR)">
          <p>
            As we operate within the European Union, our processing of your
            personal data is based on the following legal grounds under the
            General Data Protection Regulation (GDPR):
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Contract performance:</strong> processing necessary to
              fulfill your booking.
            </li>
            <li>
              <strong>Legitimate interests:</strong> improving our services and
              preventing fraud.
            </li>
            <li>
              <strong>Consent:</strong> sending optional marketing
              communications (you may withdraw consent at any time).
            </li>
            <li>
              <strong>Legal obligation:</strong> compliance with applicable laws
              and regulations.
            </li>
          </ul>
        </Section>

        <Section title="5. Cookies">
          <p>
            We use cookies and similar tracking technologies to enhance your
            browsing experience and gather analytics. You can control cookies
            through your browser settings. Disabling cookies may affect some
            features of the site.
          </p>
          <p>We use the following types of cookies:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Essential cookies:</strong> required for core
              functionality such as session management.
            </li>
            <li>
              <strong>Analytics cookies:</strong> help us understand how
              visitors interact with our site (e.g. Google Analytics).
            </li>
          </ul>
        </Section>

        <Section title="6. Third-Party Services">
          <p>
            We share your data only with trusted third parties necessary to
            deliver our services:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Stripe</strong> — payment processing.
            </li>
            <li>
              <strong>Supabase</strong> — secure database and authentication
              hosting.
            </li>
            <li>
              <strong>Google Analytics</strong> — anonymised website usage
              statistics.
            </li>
          </ul>
          <p>
            We do not sell, rent, or trade your personal data to any third party
            for marketing purposes.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>
            We retain your personal data only for as long as necessary to fulfil
            the purposes set out in this policy, or as required by law. Booking
            records are kept for a minimum of 5 years to comply with Portuguese
            tax regulations. You may request deletion of your data at any time
            (subject to legal retention requirements).
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>Under the GDPR you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request erasure of your data ("right to be forgotten").</li>
            <li>Object to or restrict processing of your data.</li>
            <li>
              Data portability — receive your data in a structured format.
            </li>
            <li>
              Lodge a complaint with the Portuguese data protection authority
              (CNPD) at{" "}
              <a
                href="https://www.cnpd.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                www.cnpd.pt
              </a>
              .
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:tukinlisbon2@gmail.com"
              className="text-primary underline"
            >
              tukinlisbon2@gmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="9. Data Security">
          <p>
            We implement appropriate technical and organisational measures to
            protect your personal data against unauthorised access, alteration,
            disclosure, or destruction. All data is transmitted over HTTPS and
            stored on secured servers. Payment data is handled exclusively by
            Stripe and is never stored on our systems.
          </p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            Our services are not directed to children under the age of 16. We do
            not knowingly collect personal data from children. If you believe we
            have inadvertently collected such data, please contact us
            immediately.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated revision date. We encourage you
            to review this policy periodically. Continued use of our services
            after changes are posted constitutes your acceptance of the updated
            policy.
          </p>
        </Section>

        <Section title="12. Contact Us">
          <p>
            If you have any questions or concerns about this Privacy Policy,
            please contact us:
          </p>
          <ul className="list-none space-y-1 pl-0">
            <li>
              <strong>Entertainment Mama</strong>
            </li>
            <li>Lisbon, Portugal</li>
            <li>
              Email:{" "}
              <a
                href="mailto:tukinlisbon2@gmail.com"
                className="text-primary underline"
              >
                tukinlisbon2@gmail.com
              </a>
            </li>
            <li>Phone: +351 920 377 914</li>
          </ul>
        </Section>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
