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

const TermsOfService = () => {
  return (
    <div className="bg-background-light text-gray-800 font-display antialiased">
      <SEO
        title="Terms of Service | Entertainment Mama – Lisbon Tuk-Tuk Tours"
        description="Read the Terms of Service governing your use of Entertainment Mama's website and tuk-tuk tour booking services in Lisbon, Portugal."
      />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 pt-28 sm:pt-32 pb-10 sm:pb-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-primary font-bold tracking-wider uppercase text-[11px] sm:text-xs">
            Legal
          </span>
          <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500">
            Last updated: 11 March 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using the Entertainment Mama website (
            <strong>tukinlisbon.com</strong>) or booking any of our tuk-tuk tour
            services, you acknowledge that you have read, understood, and agree
            to be bound by these Terms of Service ("Terms") and our Privacy
            Policy. If you do not agree with any part of these Terms, you must
            not use our services.
          </p>
          <p>
            We reserve the right to modify these Terms at any time. Changes take
            effect immediately upon posting. Your continued use of the service
            after changes are published constitutes acceptance of the revised
            Terms.
          </p>
        </Section>

        <Section title="2. Services Provided">
          <p>
            Entertainment Mama offers guided private tuk-tuk tours in Lisbon,
            Portugal, operated in 100% electric vehicles. Our services include:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Online booking and reservation management.</li>
            <li>Private guided tours of Lisbon and its surroundings.</li>
            <li>Customised route planning based on guest preferences.</li>
            <li>Multilingual guiding services.</li>
          </ul>
          <p>
            We reserve the right to modify, suspend, or discontinue any aspect
            of the service at any time without prior notice.
          </p>
        </Section>

        <Section title="3. Booking & Payment">
          <p>
            All bookings are subject to availability and are confirmed only upon
            receipt of full payment. By completing a booking you warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You are at least 18 years of age.</li>
            <li>
              All information provided during booking is accurate and complete.
            </li>
            <li>You are authorised to use the payment method provided.</li>
          </ul>
          <p>
            Payments are processed securely by Stripe. Prices are quoted in
            Euros (€) and include applicable taxes unless stated otherwise.
            Entertainment Mama reserves the right to adjust prices at any time
            without prior notice; however, confirmed bookings will not be
            subject to price increases.
          </p>
        </Section>

        <Section title="4. Cancellation & Refund Policy">
          <p>We understand plans can change. Our cancellation terms are:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>More than 48 hours before the tour:</strong> Full refund.
            </li>
            <li>
              <strong>24–48 hours before the tour:</strong> 50% refund.
            </li>
            <li>
              <strong>Less than 24 hours before the tour:</strong> No refund.
            </li>
            <li>
              <strong>No-show:</strong> No refund.
            </li>
          </ul>
          <p>
            Cancellations must be submitted in writing via email to{" "}
            <a
              href="mailto:tukinlisbon2@gmail.com"
              className="text-primary underline"
            >
              tukinlisbon2@gmail.com
            </a>{" "}
            or via WhatsApp at +351 920 377 914. The cancellation date and time
            will be considered as when we receive your message.
          </p>
          <p>
            In the event that Entertainment Mama cancels a tour due to
            unforeseen circumstances (e.g., extreme weather, vehicle breakdown,
            or guide illness), you will receive a full refund or the option to
            reschedule at no extra cost.
          </p>
        </Section>

        <Section title="5. Tour Conduct & Safety">
          <p>
            To ensure the safety and enjoyment of all participants, guests must:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Follow all instructions given by the guide at all times.</li>
            <li>
              Remain seated and wear seatbelts (where fitted) during the tour.
            </li>
            <li>
              Refrain from consuming alcohol or illegal substances before or
              during the tour.
            </li>
            <li>Treat the guide and fellow guests with respect.</li>
            <li>
              Disclose any physical conditions or disabilities that could affect
              participation prior to booking.
            </li>
          </ul>
          <p>
            Entertainment Mama reserves the right to refuse service or remove
            any guest from a tour who poses a risk to themselves, other guests,
            or the guide, without entitlement to a refund.
          </p>
        </Section>

        <Section title="6. Health & Accessibility">
          <p>
            Our tuk-tuks are designed to accommodate most guests, but may not be
            suitable for guests with certain mobility limitations. Please
            contact us before booking if you have accessibility concerns and we
            will do our best to accommodate your needs.
          </p>
          <p>
            Guests participate in all activities at their own risk. We recommend
            appropriate clothing and footwear for outdoor tours.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the fullest extent permitted by applicable law, Entertainment
            Mama shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising from your use of our
            services, including but not limited to loss of enjoyment, personal
            injury sustained during optional walking portions, or loss of
            personal belongings.
          </p>
          <p>
            Our total liability to you in connection with a booking shall not
            exceed the total amount paid by you for that booking.
          </p>
          <p>
            Nothing in these Terms excludes or limits our liability for death or
            personal injury caused by our negligence, fraud, or any other
            liability that cannot be excluded by law.
          </p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>
            All content on the Entertainment Mama website — including text,
            photographs, logos, videos, and tour descriptions — is the property
            of Entertainment Mama or its licensors and is protected by
            applicable copyright and intellectual property laws. You may not
            reproduce, distribute, or use any content without our prior written
            consent.
          </p>
        </Section>

        <Section title="9. User-Generated Content">
          <p>
            By submitting a review, photo, or testimonial through our website,
            you grant Entertainment Mama a non-exclusive, royalty-free,
            worldwide licence to use, display, and reproduce that content for
            marketing and promotional purposes. You confirm that you own or have
            the right to share the content submitted.
          </p>
        </Section>

        <Section title="10. Third-Party Links">
          <p>
            Our website may contain links to third-party websites for your
            convenience. These links do not constitute an endorsement by
            Entertainment Mama. We have no control over the content of those
            sites and accept no responsibility for them or for any loss or
            damage that may arise from your use of them.
          </p>
        </Section>

        <Section title="11. Governing Law & Dispute Resolution">
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of Portugal. Any disputes arising in connection with these
            Terms shall first be attempted to be resolved amicably. If
            unresolved, disputes shall be subject to the exclusive jurisdiction
            of the courts of Lisbon, Portugal.
          </p>
          <p>
            Consumers resident in the EU may also use the Online Dispute
            Resolution platform provided by the European Commission at{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              ec.europa.eu/consumers/odr
            </a>
            .
          </p>
        </Section>

        <Section title="12. Contact Us">
          <p>
            If you have any questions about these Terms of Service, please
            contact us:
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

export default TermsOfService;
