import React from 'react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const InsurancePolicy = () => {
  return (
    <div className="bg-white min-h-screen pt-16">
      <SEO title="Insurance Policy" description="Read our insurance policies covering our Tuk Tuk tours." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight font-display">
          Insurance Policy
        </h1>
        
        <div className="prose prose-sm sm:prose-base text-gray-600 max-w-none space-y-6">
          <p>
            At Tuk in Lisbon, the safety and security of our guests are our top priorities. As a fully registered and certified tour operator by Tourism of Portugal (Turismo de Portugal), we strictly comply with all national regulatory and insurance requirements.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
            1. Insurance Coverage
          </h2>
          <p>
            All our vehicles and operations are covered by mandatory insurance policies as dictated by Portuguese law for tourist animation companies (Animação Turística). Our coverage includes:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li><strong>Civil Liability Insurance (Seguro de Responsabilidade Civil):</strong> Covers any third-party property damage or bodily injuries that might occur during our tours.</li>
            <li><strong>Personal Accident Insurance (Seguro de Acidentes Pessoais):</strong> Covers all passengers traveling in our Tuk Tuks during the duration of the booked tour.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
            2. Scope and Limitations
          </h2>
          <p>
            The insurance policies are valid strictly for the duration of the tour, starting when the guest boards the vehicle and ending when the guest disembarks at the conclusion of the trip.
          </p>
          <p>
            The coverage is subject to the terms, conditions, and exclusions set forth by our insurance provider. It does not cover incidents resulting from:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Guests ignoring direct safety instructions from the guide or driver.</li>
            <li>Reckless or negligent behavior by the guest (e.g., standing up while the vehicle is in motion, leaning excessively outside the vehicle).</li>
            <li>Pre-existing medical conditions not disclosed prior to the tour.</li>
            <li>Loss, theft, or damage of personal belongings (e.g., phones, cameras, wallets) left unattended or dropped during the ride.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
            3. Passenger Responsibility
          </h2>
          <p>
            We kindly ask all guests to follow the safety briefing provided by the driver before the tour commences. Keep your seatbelts fastened if the vehicle is equipped with them, remain seated while the vehicle is in motion, and keep arms and legs inside the vehicle.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
            4. Claims and Reporting
          </h2>
          <p>
            In the remote event of an incident or accident, guests must immediately notify the driver/guide. Official reports and documentation must be filed promptly to ensure the incident is covered under the respective insurance policies. Failure to report an incident during or immediately after the tour may result in the denial of an insurance claim.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
            5. Contact Information
          </h2>
          <p>
            If you have specific questions regarding our insurance policies, coverages, or limits, please feel free to contact us at:
          </p>
          <p className="mt-2">
            <strong>Email:</strong> tukinlisbon2@gmail.com<br/>
            <strong>Phone:</strong> +351 920 377 914
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InsurancePolicy;
