import React from 'react';

const sections = [
  {
    title: 'Registration information',
    body: 'When you use Activate, we collect the full name, email address, and phone number you submit. We currently store this information so Junah can use it for future notices about releases, events, discounts, and related news. Registration does not begin automated email or text-message campaigns at this time.'
  },
  {
    title: 'Your choices and privacy',
    body: 'We do not sell registration information. We keep it only as long as reasonably needed for the purposes described here. To ask what information we hold, correct it, or request deletion, contact admin@junah.blue. Any future email or SMS program will provide the consent and opt-out choices required for that program.'
  },
  {
    title: 'Trademarks',
    body: 'Junah, Junahblue, Junah.blue, associated logos, and other source-identifying brand material belong to their respective owner. Nothing on this site grants permission to use them in a way that suggests sponsorship, endorsement, or affiliation.'
  },
  {
    title: 'Copyright',
    body: 'Unless otherwise noted, the music, writing, photography, artwork, video, apparel designs, and site content are protected by copyright and may not be copied, republished, distributed, or commercially used without permission.'
  },
  {
    title: 'Changes and contact',
    body: 'These terms may be updated as the site and its services change. Material updates will be reflected here with a revised effective date. Questions and requests can be sent to admin@junah.blue.'
  }
];

export const TermsPage: React.FC = () => (
  <div className="bg-white pb-20">
    <article className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-16">
      <h1 className="text-5xl font-bold text-brand-ink md:text-7xl">TERMS &amp; CONDITIONS</h1>
      <p className="mt-4 font-semibold text-brand-ink">Effective August 7, 2026</p>
      <p className="mt-3 max-w-3xl text-sm text-brand-ink/70">
        This page is a plain-language site policy and is not legal advice.
      </p>

      <div className="mt-10 space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="bg-brand-gray p-5 md:p-8">
            <h2 className="text-2xl font-bold text-black md:text-3xl">{section.title}</h2>
            <p className="mt-3 leading-relaxed text-brand-ink">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  </div>
);
