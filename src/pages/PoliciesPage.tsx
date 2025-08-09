import React from 'react';
import SEO from '../components/SEO';

export default function PoliciesPage() {
  return (
    <>
      <SEO 
        title="Policies"
        description="Learn about Paisán's policies, terms of service, and privacy guidelines."
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-6xl font-bold italic text-[#F4A024] mb-12 paisan-text text-center">
            Policies
          </h1>

          <div className="space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-[#F4A024] mb-6">Terms of Service</h2>
              <div className="prose prose-invert">
                <p className="text-gray-300">
               <p className="mb-4">By using Paisán, users agree to use the platform only for lawful purposes and acknowledge that Paisán serves solely as a connector between buyers and Latin American suppliers and their associated marketplaces. Paisán does not purport to own or sell any of these products directly, all ownership and corresponding benefits is attributed to the product's suppliers and respective marketplaces.
               </p>

<p className="mb-4">All product listings, pricing, and supplier details are provided by third parties, and while we strive for accuracy, Paisán does not guarantee this information. We currently do not handle payments, shipments, or contracts between buyers and suppliers, and are not liable for any losses or issues that may arise from those transactions. 
</p>
<p className="mb-4">We reserve the right to remove any content, listings, or suppliers that violate our policies or engage in fraudulent or unethical behavior. </p>
                </p>
                <p className="text-gray-300 mt-4">
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[#F4A024] mb-6">Privacy Policy</h2>
              <div className="prose prose-invert">
                <p className="text-gray-300">
                  We collect only the minimum information necessary to provide and improve our services. Your personal data is protected using industry-standard security measures.

Data collected may include contact information, account preferences, and usage data, which we use to maintain platform integrity and enhance functionality. You can request to access, update, or delete your personal data at any time by contacting our support team.

We are committed to transparency, trust, and security in every aspect of our data practices.


                </p>
                <p className="text-gray-300 mt-4">
                </p>
              </div>
            </section>


<section className="mt-10">
  <h2 className="text-3xl font-bold text-[#F4A024] mb-6">Buyer Guidelines</h2>
  <div className="prose prose-invert text-gray-300">
    <p>
      Buyers are expected to engage in respectful, professional communication with suppliers. To foster a safe and productive environment, the following behaviors are strictly prohibited:
    </p>
    <ul className="list-disc pl-5">
      <li>Harassment, threats, or abusive language</li>
      <li>Inappropriate, off-topic, or spammy messages</li>
      <li>Misrepresentation of intent or identity</li>
    </ul>

    <p className="mt-4">
      Violations of these guidelines may result in warnings, restrictions, or permanent suspension from the platform.
    </p>

    <p className="mt-2">
      All communication with suppliers should remain business-focused. Repeated inappropriate or unsolicited contact may be treated as harassment.
    </p>
  </div>
</section>

           <section>
  <h2 className="text-3xl font-bold text-[#F4A024] mb-6">Suppliers</h2>
  <div className="prose prose-invert text-gray-300">
    
    <p className="mt-4">
      We reserve the right to remove or restrict supplier accounts that:
    </p>
    <ul className="list-disc pl-5">
      <li>Post misleading, false, or deceptive listings</li>
      <li>Fail to uphold communication standards</li>
      <li>Breach platform rules or local laws</li>
    </ul>

    <p className="mt-4">
      <p className="mt-4">
  Currently, Paisán only accepts suppliers based in <span className="font-bold text-[#F4A024]">Mexico</span> to maintain quality control and ensure dependable service.
</p>

    </p>
  </div>
</section>
          </div>
        </div>
      </div>
    </>
  );
}