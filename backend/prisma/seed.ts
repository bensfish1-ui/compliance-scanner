import { PrismaClient, UserRole, RegulationStatus, TaskStatus, TaskPriority, ProjectStatus, AuditType, AuditStatus, FindingSeverity, FindingStatus, DocumentStatus, RiskLikelihood, RiskConsequence, RAGStatus, NotificationType, WorkflowTrigger, ImpactLevel, ApprovalStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Admin User ──────────────────────────────────────────────────────────────

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@compliancescanner.io' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@compliancescanner.io',
      name: 'System Administrator',
      role: UserRole.ADMIN,
      department: 'Legal & Compliance',
      isActive: true,
    },
  });

  const analystUser = await prisma.user.upsert({
    where: { email: 'analyst@compliancescanner.io' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'analyst@compliancescanner.io',
      name: 'Jane Analyst',
      role: UserRole.COMPLIANCE_OFFICER,
      department: 'Legal & Compliance',
      isActive: true,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@compliancescanner.io' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'manager@compliancescanner.io',
      name: 'Tom Manager',
      role: UserRole.MANAGER,
      department: 'Legal & Compliance',
      isActive: true,
    },
  });

  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@compliancescanner.io' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'viewer@compliancescanner.io',
      name: 'Sarah Viewer',
      role: UserRole.VIEWER,
      department: 'Legal & Compliance',
      isActive: true,
    },
  });

  console.log('Users seeded.');

  // ─── Countries ───────────────────────────────────────────────────────────────

  const countriesData = [
    { code: 'GB', name: 'United Kingdom', region: 'Europe' },
    { code: 'GG', name: 'Guernsey', region: 'Europe' },
    { code: 'IE', name: 'Ireland', region: 'Europe' },
    { code: 'AU', name: 'Australia', region: 'Asia Pacific' },
    { code: 'NZ', name: 'New Zealand', region: 'Asia Pacific' },
    { code: 'NL', name: 'Netherlands', region: 'Europe' },
    { code: 'DK', name: 'Denmark', region: 'Europe' },
    { code: 'SE', name: 'Sweden', region: 'Europe' },
    { code: 'NO', name: 'Norway', region: 'Europe' },
    { code: 'FI', name: 'Finland', region: 'Europe' },
    { code: 'CA', name: 'Canada', region: 'North America' },
    { code: 'EU', name: 'European Union', region: 'Europe' },
  ];

  const countries: Record<string, any> = {};
  for (const c of countriesData) {
    countries[c.code] = await prisma.country.upsert({
      where: { code: c.code },
      update: {},
      create: { id: uuidv4(), ...c },
    });
  }

  console.log('Countries seeded.');

  // ─── Regulators ──────────────────────────────────────────────────────────────

  const regulatorsData = [
    // UK
    { name: 'General Optical Council', abbreviation: 'GOC', countryCode: 'GB', website: 'https://optical.org', description: 'UK regulator for optometrists, dispensing opticians, and optical businesses.' },
    { name: 'Care Quality Commission', abbreviation: 'CQC', countryCode: 'GB', website: 'https://www.cqc.org.uk', description: 'Independent regulator of health and social care in England.' },
    { name: 'Health and Care Professions Council', abbreviation: 'HCPC', countryCode: 'GB', website: 'https://www.hcpc-uk.org', description: 'UK regulator of health and care professionals including hearing aid dispensers.' },
    { name: 'Medicines and Healthcare products Regulatory Agency', abbreviation: 'MHRA', countryCode: 'GB', website: 'https://www.gov.uk/government/organisations/mhra', description: 'UK regulator of medicines, medical devices and blood components for transfusion.' },
    { name: 'Financial Conduct Authority', abbreviation: 'FCA', countryCode: 'GB', website: 'https://www.fca.org.uk', description: 'UK financial services regulator responsible for regulating financial firms and maintaining market integrity.' },
    { name: 'Information Commissioner\'s Office', abbreviation: 'ICO', countryCode: 'GB', website: 'https://ico.org.uk', description: 'UK independent authority upholding information rights in the public interest.' },
    { name: 'Health and Safety Executive', abbreviation: 'HSE', countryCode: 'GB', website: 'https://www.hse.gov.uk', description: 'UK regulator for workplace health, safety, and welfare.' },
    { name: 'Advertising Standards Authority', abbreviation: 'ASA', countryCode: 'GB', website: 'https://www.asa.org.uk', description: 'UK independent regulator of advertising across all media.' },
    { name: 'Competition and Markets Authority', abbreviation: 'CMA', countryCode: 'GB', website: 'https://www.gov.uk/government/organisations/competition-and-markets-authority', description: 'UK regulator promoting competition and preventing unfair trading for the benefit of consumers.' },
    { name: 'Environment Agency', abbreviation: 'EA', countryCode: 'GB', website: 'https://www.gov.uk/government/organisations/environment-agency', description: 'UK executive agency responsible for environmental protection and regulation.' },
    { name: 'NHS England', abbreviation: 'NHSE', countryCode: 'GB', website: 'https://www.england.nhs.uk', description: 'Oversees the NHS budget, commissioning, and service delivery across England.' },
    { name: 'Equality and Human Rights Commission', abbreviation: 'EHRC', countryCode: 'GB', website: 'https://www.equalityhumanrights.com', description: 'UK statutory body established to help eliminate discrimination and promote equality.' },
    { name: 'Home Office', abbreviation: 'HO', countryCode: 'GB', website: 'https://www.gov.uk/government/organisations/home-office', description: 'UK government department responsible for immigration, security, and modern slavery enforcement.' },
    // Ireland
    { name: 'CORU - Health and Social Care Professionals Council', abbreviation: 'CORU', countryCode: 'IE', website: 'https://www.coru.ie', description: 'Irish regulator of health and social care professionals including optometrists and dispensing opticians.' },
    { name: 'Data Protection Commission', abbreviation: 'DPC', countryCode: 'IE', website: 'https://www.dataprotection.ie', description: 'Irish national independent authority responsible for upholding the right of individuals to have their personal data protected.' },
    { name: 'Health Information and Quality Authority', abbreviation: 'HIQA', countryCode: 'IE', website: 'https://www.hiqa.ie', description: 'Irish independent authority established to drive high-quality and safe care for health and social care services.' },
    // Australia
    { name: 'Australian Health Practitioner Regulation Agency', abbreviation: 'AHPRA', countryCode: 'AU', website: 'https://www.ahpra.gov.au', description: 'Australian national body regulating health practitioners including optometrists.' },
    { name: 'Therapeutic Goods Administration', abbreviation: 'TGA', countryCode: 'AU', website: 'https://www.tga.gov.au', description: 'Australian government authority for the regulation of therapeutic goods including medical devices.' },
    { name: 'Australian Competition and Consumer Commission', abbreviation: 'ACCC', countryCode: 'AU', website: 'https://www.accc.gov.au', description: 'Australian independent statutory authority promoting competition, fair trading and product safety.' },
    { name: 'Office of the Australian Information Commissioner', abbreviation: 'OAIC', countryCode: 'AU', website: 'https://www.oaic.gov.au', description: 'Australian national regulator for privacy and freedom of information.' },
    { name: 'Attorney-General\'s Department', abbreviation: 'AG-AU', countryCode: 'AU', website: 'https://www.ag.gov.au', description: 'Australian government department responsible for modern slavery act administration.' },
    // New Zealand
    { name: 'Optometrists and Dispensing Opticians Board', abbreviation: 'ODOB', countryCode: 'NZ', website: 'https://www.odob.health.nz', description: 'New Zealand statutory body regulating optometrists and dispensing opticians.' },
    { name: 'Medsafe', abbreviation: 'Medsafe', countryCode: 'NZ', website: 'https://www.medsafe.govt.nz', description: 'New Zealand Medicines and Medical Devices Safety Authority.' },
    { name: 'Office of the Privacy Commissioner', abbreviation: 'OPC', countryCode: 'NZ', website: 'https://www.privacy.org.nz', description: 'New Zealand independent officer of Parliament responsible for privacy law.' },
    // EU
    { name: 'European Data Protection Board', abbreviation: 'EDPB', countryCode: 'EU', website: 'https://edpb.europa.eu', description: 'Independent European body contributing to the consistent application of data protection rules across the EU.' },
    { name: 'European Banking Authority', abbreviation: 'EBA', countryCode: 'EU', website: 'https://www.eba.europa.eu', description: 'EU agency working to ensure effective and consistent prudential regulation across the European banking sector.' },
    { name: 'European Commission', abbreviation: 'EC', countryCode: 'EU', website: 'https://ec.europa.eu', description: 'Executive branch of the European Union responsible for proposing legislation and enforcing EU law.' },
    { name: 'European Chemicals Agency', abbreviation: 'ECHA', countryCode: 'EU', website: 'https://echa.europa.eu', description: 'EU agency responsible for the implementation of REACH and CLP regulations on chemicals.' },
    // Netherlands
    { name: 'Dutch Healthcare Inspectorate', abbreviation: 'IGJ', countryCode: 'NL', website: 'https://www.igj.nl', description: 'Dutch regulatory body for healthcare quality and safety.' },
    { name: 'Autoriteit Persoonsgegevens', abbreviation: 'AP', countryCode: 'NL', website: 'https://autoriteitpersoonsgegevens.nl', description: 'Dutch data protection authority supervising compliance with privacy legislation.' },
    // Denmark
    { name: 'Danish Patient Safety Authority', abbreviation: 'STPS', countryCode: 'DK', website: 'https://stps.dk', description: 'Danish authority responsible for patient safety and supervision of healthcare.' },
    { name: 'Datatilsynet (Denmark)', abbreviation: 'DT-DK', countryCode: 'DK', website: 'https://www.datatilsynet.dk', description: 'Danish data protection authority.' },
    // Norway
    { name: 'Norwegian Directorate of Health', abbreviation: 'HDIR', countryCode: 'NO', website: 'https://www.helsedirektoratet.no', description: 'Norwegian government agency responsible for health regulation and guidance.' },
    { name: 'Datatilsynet (Norway)', abbreviation: 'DT-NO', countryCode: 'NO', website: 'https://www.datatilsynet.no', description: 'Norwegian data protection authority.' },
    // Sweden
    { name: 'Socialstyrelsen', abbreviation: 'SoS', countryCode: 'SE', website: 'https://www.socialstyrelsen.se', description: 'Swedish National Board of Health and Welfare responsible for healthcare regulation.' },
    { name: 'Integritetsskyddsmyndigheten', abbreviation: 'IMY', countryCode: 'SE', website: 'https://www.imy.se', description: 'Swedish Authority for Privacy Protection (data protection authority).' },
    // Finland
    { name: 'Valvira', abbreviation: 'Valvira', countryCode: 'FI', website: 'https://www.valvira.fi', description: 'Finnish National Supervisory Authority for Welfare and Health.' },
    { name: 'Tietosuojavaltuutettu', abbreviation: 'TSV', countryCode: 'FI', website: 'https://tietosuoja.fi', description: 'Finnish Office of the Data Protection Ombudsman.' },
    // Canada
    { name: 'Health Canada', abbreviation: 'HC', countryCode: 'CA', website: 'https://www.canada.ca/en/health-canada.html', description: 'Canadian federal department responsible for national health policy and regulation.' },
    { name: 'Office of the Privacy Commissioner of Canada', abbreviation: 'OPC-CA', countryCode: 'CA', website: 'https://www.priv.gc.ca', description: 'Canadian federal body overseeing compliance with privacy legislation.' },
    // Guernsey
    { name: 'Guernsey Financial Services Commission', abbreviation: 'GFSC', countryCode: 'GG', website: 'https://www.gfsc.gg', description: 'Guernsey regulatory body for financial services including insurance.' },
    { name: 'Office of the Data Protection Authority', abbreviation: 'ODPA', countryCode: 'GG', website: 'https://www.odpa.gg', description: 'Guernsey independent authority responsible for data protection regulation.' },
  ];

  const regulators: Record<string, any> = {};
  for (const r of regulatorsData) {
    const regId = uuidv4();
    const existing = await prisma.regulator.findFirst({ where: { abbreviation: r.abbreviation } });
    if (existing) {
      regulators[r.abbreviation] = existing;
    } else {
      regulators[r.abbreviation] = await prisma.regulator.create({
        data: {
          id: regId,
          name: r.name,
          abbreviation: r.abbreviation,
          countryId: countries[r.countryCode].id,
          website: r.website,
          description: r.description,
        },
      });
    }
  }

  console.log('Regulators seeded.');

  // ─── Categories ──────────────────────────────────────────────────────────────

  const categoriesData = [
    { name: 'Healthcare Regulation', slug: 'healthcare-regulation', description: 'Regulations governing healthcare service delivery, clinical standards, and patient safety.', color: '#EF4444' },
    { name: 'Medical Devices', slug: 'medical-devices', description: 'Regulations governing the manufacture, supply, and use of medical devices including spectacles and hearing aids.', color: '#F97316' },
    { name: 'Data Protection & Privacy', slug: 'data-protection', description: 'Regulations governing the collection, storage, processing, and transfer of personal data.', color: '#3B82F6' },
    { name: 'Consumer Protection', slug: 'consumer-protection', description: 'Regulations protecting consumer rights, fair trading, and product safety.', color: '#F59E0B' },
    { name: 'Financial Services & Insurance', slug: 'financial-services', description: 'Regulations governing insurance, consumer credit, financial promotions, and payment services.', color: '#8B5CF6' },
    { name: 'Advertising Standards', slug: 'advertising-standards', description: 'Regulations and codes governing advertising, marketing claims, and promotional activities.', color: '#EC4899' },
    { name: 'Employment Law', slug: 'employment-law', description: 'Employment law, equality, labour standards, and workforce regulations.', color: '#A855F7' },
    { name: 'Health & Safety', slug: 'health-safety', description: 'Workplace health and safety regulations and occupational hazard management.', color: '#DC2626' },
    { name: 'Environmental & Sustainability', slug: 'environmental', description: 'Environmental regulations including waste management, chemicals, packaging, and sustainability reporting.', color: '#10B981' },
    { name: 'Modern Slavery & Supply Chain', slug: 'modern-slavery', description: 'Modern slavery legislation and supply chain due diligence requirements.', color: '#6366F1' },
    { name: 'Tax & Transfer Pricing', slug: 'tax-compliance', description: 'Tax reporting obligations, transfer pricing, and fiscal compliance requirements.', color: '#84CC16' },
    { name: 'Property & Planning', slug: 'property-planning', description: 'Property, planning, and building regulations applicable to retail store locations.', color: '#78716C' },
    { name: 'NHS & Public Health', slug: 'nhs-public-health', description: 'NHS commissioning, public health contracts, and GOS (General Ophthalmic Services) regulations.', color: '#0EA5E9' },
    { name: 'Corporate Governance', slug: 'corporate-governance', description: 'Board governance, corporate reporting, and joint venture partnership obligations.', color: '#14B8A6' },
    { name: 'Digital & Cybersecurity', slug: 'digital-cybersecurity', description: 'Cybersecurity standards, digital operational resilience, and AI governance requirements.', color: '#06B6D4' },
    { name: 'Competition Law', slug: 'competition-law', description: 'Competition and antitrust regulations across operating jurisdictions.', color: '#F43F5E' },
    { name: 'Optical Regulation', slug: 'optical-regulation', description: 'Regulations specific to the optical profession including practice standards and fitness to practise.', color: '#2563EB' },
    { name: 'Audiology Regulation', slug: 'audiology-regulation', description: 'Regulations specific to hearing care services and audiology professional standards.', color: '#7C3AED' },
  ];

  const categories: Record<string, any> = {};
  for (const c of categoriesData) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { id: uuidv4(), ...c },
    });
  }

  console.log('Categories seeded.');

  // ─── Business Areas ──────────────────────────────────────────────────────────

  const businessAreasData = [
    { name: 'Optical Retail', slug: 'optical-retail', description: 'In-store optical retail operations including eye examinations, dispensing, and contact lens services.' },
    { name: 'Audiology / Hearing Care', slug: 'audiology', description: 'Hearing care services including hearing tests, hearing aid fitting, and aftercare.' },
    { name: 'Domiciliary (Home Visits)', slug: 'domiciliary', description: 'Home visit services providing eye examinations and hearing tests to patients unable to visit a store.' },
    { name: 'Ophthalmology (Newmedica)', slug: 'ophthalmology', description: 'Ophthalmology services including cataract surgery and other eye care treatments via Newmedica.' },
    { name: 'Lens Manufacturing (Vision Labs)', slug: 'lens-manufacturing', description: 'Spectacle lens manufacturing, edging, and glazing operations.' },
    { name: 'Supply Chain & Procurement', slug: 'supply-chain', description: 'Supply chain management, procurement, and vendor relationships for frames, lenses, and hearing aids.' },
    { name: 'Digital & Technology', slug: 'digital-technology', description: 'Digital platforms, IT infrastructure, e-commerce, and cybersecurity.' },
    { name: 'Finance & Insurance', slug: 'finance-insurance', description: 'Finance, accounting, insurance services, and consumer credit operations.' },
    { name: 'Human Resources', slug: 'human-resources', description: 'HR, talent management, employee relations, and workforce compliance.' },
    { name: 'Marketing & Advertising', slug: 'marketing-advertising', description: 'Marketing campaigns, advertising, brand management, and promotional activities.' },
    { name: 'Property & Estates', slug: 'property-estates', description: 'Property portfolio management, store fit-outs, and facilities management.' },
    { name: 'Legal & Compliance', slug: 'legal-compliance', description: 'Legal department, regulatory affairs, compliance monitoring, and policy management.' },
    { name: 'NHS Community Services', slug: 'nhs-community', description: 'NHS-commissioned services including GOS eye examinations, enhanced services, and community ophthalmology.' },
  ];

  const businessAreas: Record<string, any> = {};
  for (const b of businessAreasData) {
    businessAreas[b.slug] = await prisma.businessArea.upsert({
      where: { slug: b.slug },
      update: {},
      create: { id: uuidv4(), ...b },
    });
  }

  console.log('Business areas seeded.');

  // ─── Regulations ─────────────────────────────────────────────────────────────

  function slugify(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const regulationsData = [
    {
      title: 'UK GDPR & Data Protection Act 2018',
      slug: 'uk-gdpr-dpa-2018',
      description: 'The UK General Data Protection Regulation (retained EU law) and Data Protection Act 2018 together form the UK data protection framework governing the processing of personal data.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2018-05-25'),
      categorySlug: 'data-protection',
      regulatorAbbr: 'ICO',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/ukpga/2018/12/contents/enacted',
      impactLevel: ImpactLevel.HIGH,
      summary: 'UK implementation of GDPR standards. Governs data processing, individual rights, law enforcement processing, and intelligence services processing. Establishes the ICO as the supervisory authority. Penalties up to 4% of annual global turnover or GBP 17.5 million.',
      shortName: 'UK GDPR',
    },
    {
      title: 'EU General Data Protection Regulation',
      slug: 'eu-gdpr',
      description: 'The General Data Protection Regulation is a regulation in EU law on data protection and privacy in the European Union and the European Economic Area.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2018-05-25'),
      categorySlug: 'data-protection',
      regulatorAbbr: 'EDPB',
      countryCode: 'EU',
      sourceUrl: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Comprehensive data protection regulation requiring lawful basis for processing personal data, data subject rights, breach notification within 72 hours, Data Protection Officers, and Privacy Impact Assessments. Penalties up to 4% of annual global turnover or EUR 20 million.',
      shortName: 'EU GDPR',
    },
    {
      title: 'Opticians Act 1989',
      slug: 'opticians-act-1989',
      description: 'The Opticians Act 1989 regulates the optical professions in the United Kingdom, governing who may test sight, fit contact lenses, and sell optical appliances.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('1989-07-01'),
      categorySlug: 'optical-regulation',
      regulatorAbbr: 'GOC',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/ukpga/1989/44/contents',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Core legislation governing the optical profession. Restricts sight testing to registered optometrists/medical practitioners, regulates sale of optical appliances, defines business registration requirements, and establishes the GOC regulatory framework.',
      shortName: 'Opticians Act',
    },
    {
      title: 'Health and Social Care Act 2008',
      slug: 'health-social-care-act-2008',
      description: 'The Health and Social Care Act 2008 established the Care Quality Commission and set out the framework for regulating health and social care activities in England.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2009-04-01'),
      categorySlug: 'healthcare-regulation',
      regulatorAbbr: 'CQC',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/ukpga/2008/14/contents',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Establishes the CQC regulatory framework for healthcare services. Requires registration for regulated activities, compliance with fundamental standards, and enables inspection and enforcement. Applies to domiciliary and ophthalmology services.',
      shortName: 'HSCA 2008',
    },
    {
      title: 'EU Medical Devices Regulation 2017/745',
      slug: 'eu-mdr-2017',
      description: 'The EU Medical Devices Regulation establishes a new regulatory framework for medical devices within the European Union, replacing the Medical Devices Directive.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2021-05-26'),
      categorySlug: 'medical-devices',
      regulatorAbbr: 'EC',
      countryCode: 'EU',
      sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0745',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Comprehensive regulation for medical devices including contact lenses and spectacle lenses. Requires Unique Device Identification (UDI), post-market surveillance, clinical evaluation, and conformity assessment. Applies to EU/EEA operations.',
      shortName: 'EU MDR',
    },
    {
      title: 'UK Medical Devices Regulations 2002',
      slug: 'uk-mdr-2002',
      description: 'The UK Medical Devices Regulations 2002 (as amended) implement the regulatory framework for medical devices in the UK post-Brexit, governed by the MHRA.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2002-06-13'),
      categorySlug: 'medical-devices',
      regulatorAbbr: 'MHRA',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/uksi/2002/618/contents/made',
      impactLevel: ImpactLevel.HIGH,
      summary: 'UK medical devices regulation framework covering spectacle lenses, contact lenses, hearing aids and audiological equipment. Requires UKCA marking, registration with MHRA, adverse incident reporting, and vigilance obligations.',
      shortName: 'UK MDR',
    },
    {
      title: 'Consumer Rights Act 2015',
      slug: 'consumer-rights-act-2015',
      description: 'The Consumer Rights Act 2015 consolidates UK consumer protection law, covering goods, services, digital content, and unfair terms.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2015-10-01'),
      categorySlug: 'consumer-protection',
      regulatorAbbr: 'CMA',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/ukpga/2015/15/contents/enacted',
      impactLevel: ImpactLevel.MEDIUM,
      summary: 'Establishes consumer rights for goods (including spectacles), services (including eye examinations), and digital content. Covers satisfactory quality, fitness for purpose, right to repair or replace, unfair contract terms, and enforcement powers.',
      shortName: 'CRA 2015',
    },
    {
      title: 'Modern Slavery Act 2015',
      slug: 'modern-slavery-act-2015',
      description: 'The Modern Slavery Act 2015 is UK legislation designed to combat modern slavery and human trafficking, including supply chain transparency requirements.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2015-07-31'),
      categorySlug: 'modern-slavery',
      regulatorAbbr: 'HO',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/ukpga/2015/30/contents/enacted',
      impactLevel: ImpactLevel.MEDIUM,
      summary: 'Requires commercial organisations with turnover over GBP 36 million to publish annual slavery and human trafficking statements. Covers supply chain due diligence, policies, training, and risk assessment. Relevant to frame, lens, and hearing aid supply chains.',
      shortName: 'MSA 2015',
    },
    {
      title: 'Australian Modern Slavery Act 2018',
      slug: 'au-modern-slavery-act-2018',
      description: 'The Australian Modern Slavery Act 2018 requires entities with annual consolidated revenue of AUD 100 million or more to report on modern slavery risks in their operations and supply chains.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2019-01-01'),
      categorySlug: 'modern-slavery',
      regulatorAbbr: 'AG-AU',
      countryCode: 'AU',
      sourceUrl: 'https://www.legislation.gov.au/Details/C2018A00153',
      impactLevel: ImpactLevel.MEDIUM,
      summary: 'Requires annual modern slavery statements detailing risks in operations and supply chains, actions taken to assess and address risks, and effectiveness of those actions. Applies to Specsavers Australian operations.',
      shortName: 'AU MSA 2018',
    },
    {
      title: 'Health and Safety at Work Act 1974',
      slug: 'health-safety-work-act-1974',
      description: 'The Health and Safety at Work etc. Act 1974 is the primary legislation governing workplace health and safety in Great Britain.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('1974-07-31'),
      categorySlug: 'health-safety',
      regulatorAbbr: 'HSE',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/ukpga/1974/37/contents',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Fundamental workplace health and safety legislation. Requires employers to ensure health, safety, and welfare of employees and others affected by business activities. Applies to all Specsavers retail stores, laboratories, and office locations.',
      shortName: 'HSWA 1974',
    },
    {
      title: 'Equality Act 2010',
      slug: 'equality-act-2010',
      description: 'The Equality Act 2010 legally protects people from discrimination in the workplace and wider society, consolidating previous anti-discrimination legislation.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2010-10-01'),
      categorySlug: 'employment-law',
      regulatorAbbr: 'EHRC',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/ukpga/2010/15/contents',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Prohibits discrimination based on protected characteristics. Requires reasonable adjustments for disabled persons, equal pay, and accessible services. Particularly relevant for optical and audiology services serving patients with disabilities.',
      shortName: 'EA 2010',
    },
    {
      title: 'NIS2 Directive',
      slug: 'nis2-directive',
      description: 'NIS2 is the EU-wide legislation on cybersecurity, providing legal measures to boost the overall level of cybersecurity in the EU by ensuring Member States preparedness.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2024-10-17'),
      categorySlug: 'digital-cybersecurity',
      regulatorAbbr: 'EC',
      countryCode: 'EU',
      sourceUrl: 'https://eur-lex.europa.eu/eli/dir/2022/2555',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Expands scope of cybersecurity obligations to essential and important entities including healthcare. Requires risk management measures, incident reporting within 24 hours, supply chain security, and management body accountability. Penalties up to EUR 10 million or 2% of global turnover.',
      shortName: 'NIS2',
    },
    {
      title: 'EU Artificial Intelligence Act',
      slug: 'eu-ai-act',
      description: 'The EU AI Act establishes a comprehensive legal framework for artificial intelligence systems based on their risk level.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2024-08-01'),
      categorySlug: 'digital-cybersecurity',
      regulatorAbbr: 'EC',
      countryCode: 'EU',
      sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52021PC0206',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Risk-based framework for AI systems. Healthcare AI systems may be classified as high-risk. Relevant to AI-powered diagnostic tools in optometry and audiology. Requires conformity assessments, transparency, and human oversight.',
      shortName: 'EU AI Act',
    },
    {
      title: 'Privacy Act 1988 (Australia)',
      slug: 'au-privacy-act-1988',
      description: 'The Australian Privacy Act 1988 regulates the handling of personal information by Australian Government agencies and private sector organisations.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('1989-01-01'),
      categorySlug: 'data-protection',
      regulatorAbbr: 'OAIC',
      countryCode: 'AU',
      sourceUrl: 'https://www.legislation.gov.au/Series/C2004A03712',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Establishes 13 Australian Privacy Principles governing collection, use, disclosure, quality, security, access, and correction of personal information. Notifiable Data Breaches scheme requires reporting. Penalties up to AUD 50 million. Covers patient health records.',
      shortName: 'AU Privacy Act',
    },
    {
      title: 'Privacy Act 2020 (New Zealand)',
      slug: 'nz-privacy-act-2020',
      description: 'The New Zealand Privacy Act 2020 replaced the Privacy Act 1993 and modernised the privacy framework for New Zealand.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2020-12-01'),
      categorySlug: 'data-protection',
      regulatorAbbr: 'OPC',
      countryCode: 'NZ',
      sourceUrl: 'https://www.legislation.govt.nz/act/public/2020/0031/latest/LMS23223.html',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Establishes 13 information privacy principles. Introduces mandatory breach notification, compliance notices, and new cross-border disclosure rules. Applies to patient and customer data in NZ Specsavers operations.',
      shortName: 'NZ Privacy Act',
    },
    {
      title: 'Personal Information Protection and Electronic Documents Act',
      slug: 'pipeda',
      description: 'PIPEDA is the Canadian federal privacy law for private-sector organisations governing how they collect, use, and disclose personal information.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2004-01-01'),
      categorySlug: 'data-protection',
      regulatorAbbr: 'OPC-CA',
      countryCode: 'CA',
      sourceUrl: 'https://laws-lois.justice.gc.ca/eng/acts/p-8.6/',
      impactLevel: ImpactLevel.MEDIUM,
      summary: 'Governs collection, use, and disclosure of personal information in commercial activities. Based on 10 fair information principles including consent, limiting collection, and accountability. Applies to Specsavers Canadian operations.',
      shortName: 'PIPEDA',
    },
    {
      title: 'Guernsey Data Protection Law 2017',
      slug: 'gg-data-protection-2017',
      description: 'The Data Protection (Bailiwick of Guernsey) Law 2017 aligns Guernsey data protection with the EU GDPR framework.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2019-05-25'),
      categorySlug: 'data-protection',
      regulatorAbbr: 'ODPA',
      countryCode: 'GG',
      sourceUrl: 'https://www.odpa.gg/data-protection-law/',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Guernsey GDPR-equivalent data protection framework applicable to Specsavers HQ operations. Covers lawful processing, data subject rights, breach notification, and international transfers. Enforced by the ODPA.',
      shortName: 'GG DPL 2017',
    },
    {
      title: 'Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013',
      slug: 'consumer-contracts-regs-2013',
      description: 'UK regulations implementing the EU Consumer Rights Directive, covering information requirements and cancellation rights for consumer contracts.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2014-06-13'),
      categorySlug: 'consumer-protection',
      regulatorAbbr: 'CMA',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/uksi/2013/3134/contents/made',
      impactLevel: ImpactLevel.MEDIUM,
      summary: 'Requires pre-contract information for on-premises, off-premises, and distance contracts. Establishes 14-day cancellation rights for distance and off-premises contracts. Relevant to online and telephone orders for spectacles and contact lenses.',
      shortName: 'CCR 2013',
    },
    {
      title: 'Waste Electrical and Electronic Equipment Regulations',
      slug: 'weee-regulations',
      description: 'The WEEE Regulations implement the EU WEEE Directive in the UK, establishing requirements for the collection and recycling of electrical and electronic equipment.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2014-01-01'),
      categorySlug: 'environmental',
      regulatorAbbr: 'EA',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/uksi/2013/3113/contents/made',
      impactLevel: ImpactLevel.LOW,
      summary: 'Requires producers of electrical and electronic equipment to finance collection and recycling. Applies to hearing aids, electronic testing equipment, and IT equipment. Requires registration with approved compliance scheme.',
      shortName: 'WEEE',
    },
    {
      title: 'Packaging Waste Regulations',
      slug: 'packaging-waste-regulations',
      description: 'UK regulations implementing the EU Packaging and Packaging Waste Directive, requiring producers to recover and recycle packaging waste.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2007-01-01'),
      categorySlug: 'environmental',
      regulatorAbbr: 'EA',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/uksi/2007/871/contents/made',
      impactLevel: ImpactLevel.LOW,
      summary: 'Requires businesses handling over 50 tonnes of packaging annually to register and meet recovery and recycling obligations. Applies to spectacle cases, lens packaging, hearing aid packaging, and retail packaging.',
      shortName: 'Packaging Waste',
    },
    {
      title: 'REACH Regulation',
      slug: 'reach-regulation',
      description: 'The EU REACH Regulation governs the Registration, Evaluation, Authorisation and Restriction of Chemicals used in products.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2007-06-01'),
      categorySlug: 'environmental',
      regulatorAbbr: 'ECHA',
      countryCode: 'EU',
      sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32006R1907',
      impactLevel: ImpactLevel.MEDIUM,
      summary: 'Regulates chemicals in products including frame materials, lens coatings, and cleaning solutions. Requires SVHC (Substances of Very High Concern) identification and communication through supply chain. Applies to EU/EEA markets.',
      shortName: 'REACH',
    },
    {
      title: 'FCA Consumer Credit Rules',
      slug: 'fca-consumer-credit',
      description: 'FCA rules and guidance governing consumer credit activities including point-of-sale credit and buy-now-pay-later arrangements.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2014-04-01'),
      categorySlug: 'financial-services',
      regulatorAbbr: 'FCA',
      countryCode: 'GB',
      sourceUrl: 'https://www.fca.org.uk/firms/consumer-credit',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Governs consumer credit activities including in-store credit for spectacles and hearing aids. Requires FCA authorisation, responsible lending assessments, adequate disclosures, and complaints handling. Consumer Duty applies to credit products.',
      shortName: 'FCA Credit',
    },
    {
      title: 'Insurance Act 2015',
      slug: 'insurance-act-2015',
      description: 'The Insurance Act 2015 reformed UK insurance contract law, establishing the duty of fair presentation and modernising insurance law.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2016-08-12'),
      categorySlug: 'financial-services',
      regulatorAbbr: 'FCA',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/ukpga/2015/4/contents/enacted',
      impactLevel: ImpactLevel.MEDIUM,
      summary: 'Governs insurance contracts relevant to Specsavers optical insurance and protection products. Establishes duty of fair presentation, remedies for breach, and contracting out provisions.',
      shortName: 'Insurance Act',
    },
    {
      title: 'GFSC Insurance Business Rules',
      slug: 'gfsc-insurance-rules',
      description: 'Guernsey Financial Services Commission rules governing insurance business conducted in or from within the Bailiwick of Guernsey.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2021-01-01'),
      categorySlug: 'financial-services',
      regulatorAbbr: 'GFSC',
      countryCode: 'GG',
      sourceUrl: 'https://www.gfsc.gg/legislation-policy/insurance',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Governs Specsavers insurance entities based in Guernsey. Covers solvency requirements, governance, risk management, conduct of business, and reporting obligations to the GFSC.',
      shortName: 'GFSC Insurance',
    },
    {
      title: 'CAP Code (Advertising Standards)',
      slug: 'cap-code',
      description: 'The UK Code of Non-broadcast Advertising and Direct & Promotional Marketing (CAP Code) sets the rules for non-broadcast advertising.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2010-09-01'),
      categorySlug: 'advertising-standards',
      regulatorAbbr: 'ASA',
      countryCode: 'GB',
      sourceUrl: 'https://www.asa.org.uk/codes-and-rulings/advertising-codes.html',
      impactLevel: ImpactLevel.MEDIUM,
      summary: 'Governs all non-broadcast advertising including print, online, and social media. Requires ads to be legal, decent, honest and truthful. Specific healthcare advertising rules apply to optical and audiology promotions. GOC advertising standards also apply.',
      shortName: 'CAP Code',
    },
    {
      title: 'GOC Standards of Practice for Optometrists and Dispensing Opticians',
      slug: 'goc-standards-of-practice',
      description: 'GOC Standards of Practice set out the behaviours and standards expected of GOC registrants including optometrists, dispensing opticians, and optical businesses.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2016-04-01'),
      categorySlug: 'optical-regulation',
      regulatorAbbr: 'GOC',
      countryCode: 'GB',
      sourceUrl: 'https://optical.org/en/standards-and-guidance/standards-of-practice/',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Core professional standards for optometrists and dispensing opticians. 19 standards covering patient safety, clinical competence, communication, record keeping, CPD requirements, and business conduct. Enforced through GOC fitness to practise process.',
      shortName: 'GOC Standards',
    },
    {
      title: 'TGA Medical Devices Framework',
      slug: 'tga-medical-devices',
      description: 'The Australian Therapeutic Goods Act and regulations governing the supply and use of medical devices in Australia.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2002-10-01'),
      categorySlug: 'medical-devices',
      regulatorAbbr: 'TGA',
      countryCode: 'AU',
      sourceUrl: 'https://www.tga.gov.au/how-we-regulate/manufacturing-and-registration-medical-devices',
      impactLevel: ImpactLevel.HIGH,
      summary: 'Regulates medical devices in Australia including contact lenses, spectacle lenses, and hearing aids. Requires ARTG registration, conformity assessment, post-market surveillance, and adverse event reporting.',
      shortName: 'TGA Devices',
    },
    {
      title: 'Competition Act 1998',
      slug: 'competition-act-1998',
      description: 'The Competition Act 1998 prohibits anti-competitive agreements and abuse of dominant market position in the United Kingdom.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2000-03-01'),
      categorySlug: 'competition-law',
      regulatorAbbr: 'CMA',
      countryCode: 'GB',
      sourceUrl: 'https://www.legislation.gov.uk/ukpga/1998/41/contents',
      impactLevel: ImpactLevel.MEDIUM,
      summary: 'Prohibits anti-competitive agreements (Chapter I) and abuse of dominant position (Chapter II). Relevant to Specsavers market position in UK optical retail. CMA powers include fines up to 10% of worldwide turnover.',
      shortName: 'Competition Act',
    },
    {
      title: 'Australian Consumer Law',
      slug: 'australian-consumer-law',
      description: 'Schedule 2 of the Competition and Consumer Act 2010, providing a national consumer protection framework for Australia.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2011-01-01'),
      categorySlug: 'consumer-protection',
      regulatorAbbr: 'ACCC',
      countryCode: 'AU',
      sourceUrl: 'https://www.legislation.gov.au/Details/C2022C00323',
      impactLevel: ImpactLevel.MEDIUM,
      summary: 'Comprehensive consumer protection framework covering misleading conduct, unfair contract terms, consumer guarantees, product safety, and unsolicited supplies. Applies to optical and audiology retail services in Australia.',
      shortName: 'AU Consumer Law',
    },
    {
      title: 'Corporate Sustainability Reporting Directive',
      slug: 'csrd',
      description: 'The CSRD modernises and strengthens the rules concerning the social and environmental information that companies have to report.',
      status: RegulationStatus.EFFECTIVE,
      effectiveDate: new Date('2024-01-01'),
      categorySlug: 'environmental',
      regulatorAbbr: 'EC',
      countryCode: 'EU',
      sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464',
      impactLevel: ImpactLevel.MEDIUM,
      summary: 'Requires detailed sustainability reporting using European Sustainability Reporting Standards (ESRS). Covers environmental, social, and governance factors. Requires limited assurance and digital tagging. Relevant to Specsavers EU operations reporting.',
      shortName: 'CSRD',
    },
  ];

  const regulations: Record<string, any> = {};
  for (const r of regulationsData) {
    const reg = await prisma.regulation.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        id: uuidv4(),
        title: r.title,
        slug: r.slug,
        description: r.description,
        status: r.status,
        effectiveDate: r.effectiveDate,
        categoryId: categories[r.categorySlug].id,
        regulatorId: regulators[r.regulatorAbbr].id,
        countryId: countries[r.countryCode].id,
        sourceUrl: r.sourceUrl,
        impactLevel: r.impactLevel,
        summary: r.summary,
        ownerId: adminUser.id,
      },
    });
    regulations[r.shortName] = reg;
  }

  console.log('Regulations seeded.');

  // ─── Obligations ─────────────────────────────────────────────────────────────

  const obligationsData = [
    {
      title: 'Appoint a Data Protection Officer',
      description: 'Specsavers processes health data at scale and must appoint a DPO to oversee UK GDPR compliance across all business areas.',
      regulationShortName: 'UK GDPR',
      dueDate: new Date('2025-06-01'),
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
    },
    {
      title: 'Implement Data Breach Notification Process',
      description: 'Establish a process to notify the ICO within 72 hours of becoming aware of a personal data breach affecting patient or customer data.',
      regulationShortName: 'UK GDPR',
      dueDate: new Date('2025-04-15'),
      status: TaskStatus.DONE,
      priority: TaskPriority.CRITICAL,
    },
    {
      title: 'Conduct DPIA for Patient Record System',
      description: 'Carry out Data Protection Impact Assessment for the centralised patient record system processing special category health data.',
      regulationShortName: 'UK GDPR',
      dueDate: new Date('2025-07-01'),
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
    },
    {
      title: 'GOC Business Registration Renewal',
      description: 'Ensure all optical practice business registrations are renewed with the GOC and comply with current standards.',
      regulationShortName: 'GOC Standards',
      dueDate: new Date('2025-12-31'),
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    },
    {
      title: 'Medical Device Adverse Event Reporting',
      description: 'Maintain vigilance reporting for adverse events involving contact lenses, spectacle lenses, and hearing aids to the MHRA.',
      regulationShortName: 'UK MDR',
      dueDate: new Date('2025-06-30'),
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
    },
    {
      title: 'Modern Slavery Statement Publication',
      description: 'Publish annual modern slavery statement covering supply chain due diligence for frames, lenses, hearing aids, and contact lenses.',
      regulationShortName: 'MSA 2015',
      dueDate: new Date('2025-09-30'),
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
    },
    {
      title: 'NIS2 Cybersecurity Risk Assessment',
      description: 'Conduct comprehensive cybersecurity risk assessment covering patient data systems, store networks, and supply chain IT dependencies.',
      regulationShortName: 'NIS2',
      dueDate: new Date('2025-10-17'),
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
    },
    {
      title: 'NIS2 Incident Reporting Procedures',
      description: 'Implement incident reporting procedures to notify competent authorities within 24 hours of significant cybersecurity incidents.',
      regulationShortName: 'NIS2',
      dueDate: new Date('2025-05-01'),
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
    },
    {
      title: 'FCA Consumer Credit Compliance Review',
      description: 'Review consumer credit offerings for spectacles and hearing aids to ensure compliance with FCA conduct rules and Consumer Duty.',
      regulationShortName: 'FCA Credit',
      dueDate: new Date('2025-07-31'),
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    },
    {
      title: 'Australian Privacy Act Breach Notification Readiness',
      description: 'Ensure Australian operations have Notifiable Data Breach procedures for patient health information.',
      regulationShortName: 'AU Privacy Act',
      dueDate: new Date('2025-06-30'),
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
    },
    {
      title: 'CSRD Sustainability Reporting Preparation',
      description: 'Prepare sustainability reporting capabilities aligned with ESRS for Specsavers EU operations.',
      regulationShortName: 'CSRD',
      dueDate: new Date('2026-03-31'),
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
    },
    {
      title: 'GFSC Insurance Solvency Reporting',
      description: 'Ensure Guernsey-based insurance entities meet GFSC solvency requirements and reporting deadlines.',
      regulationShortName: 'GFSC Insurance',
      dueDate: new Date('2025-12-31'),
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
    },
  ];

  const obligations: Record<string, any> = {};
  for (const o of obligationsData) {
    const obl = await prisma.obligation.create({
      data: {
        id: uuidv4(),
        title: o.title,
        description: o.description,
        regulationId: regulations[o.regulationShortName].id,
        dueDate: o.dueDate,
        status: o.status,
        priority: o.priority,
        ownerId: [adminUser.id, analystUser.id, managerUser.id][Math.floor(Math.random() * 3)],
      },
    });
    obligations[o.title.substring(0, 30)] = obl;
  }

  console.log('Obligations seeded.');

  // ─── Projects ────────────────────────────────────────────────────────────────

  const projectsData = [
    {
      title: 'UK GDPR Health Data Compliance Review',
      slug: 'uk-gdpr-health-data-review',
      description: 'Comprehensive review of UK GDPR compliance for patient health data across optical and audiology services, including DPIAs, consent mechanisms, and data subject rights processes.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-09-30'),
      ownerId: managerUser.id,
      regulationShortName: 'UK GDPR',
    },
    {
      title: 'Medical Device Regulation Transition',
      slug: 'medical-device-regulation-transition',
      description: 'Transition project to ensure compliance with EU MDR 2017/745 and UK MDR for all medical devices including contact lenses, spectacle lenses, and hearing aids across all markets.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-12-31'),
      ownerId: managerUser.id,
      regulationShortName: 'EU MDR',
    },
    {
      title: 'NIS2 Cybersecurity Implementation',
      slug: 'nis2-cybersecurity-implementation',
      description: 'Implement NIS2 Directive requirements across Specsavers European operations including cybersecurity risk management, incident reporting, and supply chain security.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-10-17'),
      ownerId: adminUser.id,
      regulationShortName: 'NIS2',
    },
    {
      title: 'Modern Slavery Act Reporting',
      slug: 'modern-slavery-act-reporting',
      description: 'Annual modern slavery reporting project covering UK and Australian operations, supply chain due diligence for frame and lens manufacturing, and hearing aid procurement.',
      status: ProjectStatus.PLANNING,
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-09-30'),
      ownerId: analystUser.id,
      regulationShortName: 'MSA 2015',
    },
    {
      title: 'GOC Practice Standards Update',
      slug: 'goc-practice-standards-update',
      description: 'Review and update all optical practice processes against current GOC Standards of Practice, including clinical governance, record keeping, and professional development tracking.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-08-31'),
      ownerId: managerUser.id,
      regulationShortName: 'GOC Standards',
    },
  ];

  const projects: Record<string, any> = {};
  for (const p of projectsData) {
    const proj = await prisma.project.create({
      data: {
        id: uuidv4(),
        title: p.title,
        slug: p.slug,
        description: p.description,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        ownerId: p.ownerId,
        regulationId: regulations[p.regulationShortName].id,
      },
    });
    projects[p.title.substring(0, 20)] = proj;
  }

  console.log('Projects seeded.');

  // ─── Tasks ───────────────────────────────────────────────────────────────────

  const projectKeys = Object.keys(projects);
  const tasksData = [
    { title: 'Audit all patient data processing activities across stores', projectKey: projectKeys[0], status: TaskStatus.DONE, priority: TaskPriority.HIGH, assigneeId: analystUser.id },
    { title: 'Update patient privacy notices for optical and audiology', projectKey: projectKeys[0], status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, assigneeId: analystUser.id },
    { title: 'Implement consent management for marketing communications', projectKey: projectKeys[0], status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, assigneeId: managerUser.id },
    { title: 'Create patient data subject request handling process', projectKey: projectKeys[0], status: TaskStatus.TODO, priority: TaskPriority.HIGH, assigneeId: analystUser.id },
    { title: 'DPIA for centralised patient record system', projectKey: projectKeys[0], status: TaskStatus.TODO, priority: TaskPriority.CRITICAL, assigneeId: managerUser.id },
    { title: 'Map all medical devices across EU and UK markets', projectKey: projectKeys[1], status: TaskStatus.IN_PROGRESS, priority: TaskPriority.CRITICAL, assigneeId: analystUser.id },
    { title: 'Implement UDI system for contact lens products', projectKey: projectKeys[1], status: TaskStatus.TODO, priority: TaskPriority.HIGH, assigneeId: analystUser.id },
    { title: 'Establish post-market surveillance for hearing aids', projectKey: projectKeys[1], status: TaskStatus.TODO, priority: TaskPriority.HIGH, assigneeId: managerUser.id },
    { title: 'Conduct cybersecurity risk assessment for store networks', projectKey: projectKeys[2], status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, assigneeId: managerUser.id },
    { title: 'Implement 24-hour incident reporting workflow', projectKey: projectKeys[2], status: TaskStatus.TODO, priority: TaskPriority.CRITICAL, assigneeId: analystUser.id },
    { title: 'Review supply chain IT security controls', projectKey: projectKeys[2], status: TaskStatus.TODO, priority: TaskPriority.HIGH, assigneeId: managerUser.id },
    { title: 'Map frame and lens supply chain for modern slavery risk', projectKey: projectKeys[3], status: TaskStatus.TODO, priority: TaskPriority.HIGH, assigneeId: analystUser.id },
    { title: 'Conduct supplier audits for hearing aid manufacturers', projectKey: projectKeys[3], status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, assigneeId: managerUser.id },
    { title: 'Audit clinical governance processes against GOC standards', projectKey: projectKeys[4], status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, assigneeId: analystUser.id },
    { title: 'Update CPD tracking for all registered professionals', projectKey: projectKeys[4], status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, assigneeId: analystUser.id },
    { title: 'Review record-keeping practices in all store formats', projectKey: projectKeys[4], status: TaskStatus.TODO, priority: TaskPriority.HIGH, assigneeId: managerUser.id },
  ];

  for (const t of tasksData) {
    await prisma.task.create({
      data: {
        id: uuidv4(),
        title: t.title,
        status: t.status,
        priority: t.priority,
        projectId: projects[t.projectKey].id,
        assigneeId: t.assigneeId,
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ─── Milestones ──────────────────────────────────────────────────────────────

  const milestonesData = [
    { title: 'Patient Data Processing Audit Complete', projectKey: projectKeys[0], dueDate: new Date('2025-03-31'), status: ProjectStatus.COMPLETED },
    { title: 'Updated Privacy Notices Published', projectKey: projectKeys[0], dueDate: new Date('2025-06-15'), status: ProjectStatus.IN_PROGRESS },
    { title: 'Full UK GDPR Health Data Compliance', projectKey: projectKeys[0], dueDate: new Date('2025-09-30'), status: ProjectStatus.NOT_STARTED },
    { title: 'Medical Device Inventory Complete', projectKey: projectKeys[1], dueDate: new Date('2025-04-30'), status: ProjectStatus.IN_PROGRESS },
    { title: 'UDI Implementation for Contact Lenses', projectKey: projectKeys[1], dueDate: new Date('2025-09-30'), status: ProjectStatus.NOT_STARTED },
    { title: 'NIS2 Gap Assessment Complete', projectKey: projectKeys[2], dueDate: new Date('2025-04-30'), status: ProjectStatus.IN_PROGRESS },
    { title: 'NIS2 Full Compliance', projectKey: projectKeys[2], dueDate: new Date('2025-10-17'), status: ProjectStatus.NOT_STARTED },
  ];

  for (const m of milestonesData) {
    await prisma.milestone.create({
      data: {
        id: uuidv4(),
        title: m.title,
        projectId: projects[m.projectKey].id,
        dueDate: m.dueDate,
        status: m.status,
      },
    });
  }

  console.log('Tasks and milestones seeded.');

  // ─── Audits ──────────────────────────────────────────────────────────────────

  const auditsData = [
    {
      title: 'Q1 2025 Patient Data Protection Audit',
      description: 'Quarterly audit of GDPR compliance for patient health data across optical and audiology business units, focusing on consent, special category data processing, and data subject rights.',
      type: AuditType.INTERNAL,
      status: AuditStatus.COMPLETED,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-02-28'),
      regulationShortName: 'UK GDPR',
      leadAuditorId: analystUser.id,
    },
    {
      title: 'GOC Practice Standards Compliance Review',
      description: 'Annual review of compliance with GOC Standards of Practice across all UK optical practices, covering clinical governance, professional conduct, and CPD.',
      type: AuditType.INTERNAL,
      status: AuditStatus.IN_PROGRESS,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-04-30'),
      regulationShortName: 'GOC Standards',
      leadAuditorId: managerUser.id,
    },
    {
      title: 'NIS2 Cybersecurity Readiness Assessment',
      description: 'Assessment of current cybersecurity posture against NIS2 requirements across all European operations, identifying gaps in incident reporting, risk management, and supply chain security.',
      type: AuditType.INTERNAL,
      status: AuditStatus.IN_PROGRESS,
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-04-15'),
      regulationShortName: 'NIS2',
      leadAuditorId: analystUser.id,
    },
    {
      title: 'Medical Device Post-Market Surveillance Review',
      description: 'Review of post-market surveillance processes for contact lenses, spectacle lenses, and hearing aids across UK and EU markets.',
      type: AuditType.INTERNAL,
      status: AuditStatus.PLANNED,
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-05-31'),
      regulationShortName: 'EU MDR',
      leadAuditorId: managerUser.id,
    },
    {
      title: 'CQC Registration Compliance Audit',
      description: 'Audit of CQC registration compliance for domiciliary and ophthalmology (Newmedica) services, covering fundamental standards and regulated activities.',
      type: AuditType.EXTERNAL,
      status: AuditStatus.PLANNED,
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-07-15'),
      regulationShortName: 'HSCA 2008',
      leadAuditorId: analystUser.id,
    },
    {
      title: 'GFSC Insurance Governance Review',
      description: 'Annual review of governance and solvency compliance for Guernsey-based insurance entities, covering GFSC conduct of business and reporting requirements.',
      type: AuditType.EXTERNAL,
      status: AuditStatus.PLANNED,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-08-31'),
      regulationShortName: 'GFSC Insurance',
      leadAuditorId: managerUser.id,
    },
  ];

  const audits: Record<string, any> = {};
  for (const a of auditsData) {
    const audit = await prisma.audit.create({
      data: {
        id: uuidv4(),
        title: a.title,
        description: a.description,
        type: a.type,
        status: a.status,
        startDate: a.startDate,
        endDate: a.endDate,
        regulationId: regulations[a.regulationShortName].id,
        leadAuditorId: a.leadAuditorId,
      },
    });
    audits[a.title.substring(0, 20)] = audit;
  }

  // ─── Audit Findings ──────────────────────────────────────────────────────────

  const auditKeys = Object.keys(audits);
  const findingsData = [
    { title: 'Incomplete patient data processing inventory', auditKey: auditKeys[0], severity: FindingSeverity.MAJOR, status: FindingStatus.OPEN, description: 'Patient data processing inventory does not cover all store formats. Domiciliary and audiology data processing activities are not fully documented.' },
    { title: 'Missing consent records for legacy patient data', auditKey: auditKeys[0], severity: FindingSeverity.MINOR, status: FindingStatus.IN_PROGRESS, description: 'Consent records for patient data collected before GDPR implementation cannot be located for approximately 20,000 patient records across older store systems.' },
    { title: 'Patient record retention schedules not enforced', auditKey: auditKeys[0], severity: FindingSeverity.MAJOR, status: FindingStatus.OPEN, description: 'Automated patient record retention and deletion processes are not implemented. Patient data is retained indefinitely in several clinical systems beyond the 10-year retention period.' },
    { title: 'Inconsistent clinical record-keeping across practices', auditKey: auditKeys[1], severity: FindingSeverity.MINOR, status: FindingStatus.OPEN, description: 'Clinical record-keeping practices vary across stores, with some not meeting GOC Standards 10 and 11 requirements for contemporaneous and complete records.' },
    { title: 'Store network segmentation gaps', auditKey: auditKeys[2], severity: FindingSeverity.MAJOR, status: FindingStatus.OPEN, description: 'Store POS and clinical systems are not adequately segmented from general store Wi-Fi networks, increasing lateral movement risk.' },
    { title: 'Cybersecurity incident response plan not tested', auditKey: auditKeys[2], severity: FindingSeverity.MINOR, status: FindingStatus.OPEN, description: 'Cybersecurity incident response plan has not been tested through tabletop exercises for European operations in the past 12 months.' },
  ];

  for (const f of findingsData) {
    await prisma.finding.create({
      data: {
        id: uuidv4(),
        title: f.title,
        description: f.description,
        auditId: audits[f.auditKey].id,
        severity: f.severity,
        status: f.status,
        ownerId: [analystUser.id, managerUser.id][Math.floor(Math.random() * 2)],
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 60 + 30) * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('Audits and findings seeded.');

  // ─── Policies ────────────────────────────────────────────────────────────────

  const policiesData = [
    { title: 'Patient Data Protection Policy', slug: 'patient-data-protection-policy', description: 'Policy governing the collection, processing, storage, and disposal of patient health data in accordance with UK GDPR, EU GDPR, and local data protection laws across all operating countries.', status: DocumentStatus.PUBLISHED, version: 3, businessAreaSlug: 'legal-compliance', effectiveDate: new Date('2024-06-01'), reviewDate: new Date('2025-06-01') },
    { title: 'Information Security Policy', slug: 'information-security-policy', description: 'Comprehensive information security policy covering access control, encryption, incident management, and security awareness for store and corporate systems.', status: DocumentStatus.PUBLISHED, version: 2, businessAreaSlug: 'digital-technology', effectiveDate: new Date('2024-09-01'), reviewDate: new Date('2025-09-01') },
    { title: 'Clinical Governance Policy', slug: 'clinical-governance-policy', description: 'Policy establishing the clinical governance framework for optical and audiology services, ensuring compliance with GOC Standards of Practice and CQC requirements.', status: DocumentStatus.PUBLISHED, version: 4, businessAreaSlug: 'optical-retail', effectiveDate: new Date('2024-03-01'), reviewDate: new Date('2025-03-01') },
    { title: 'Medical Device Vigilance Policy', slug: 'medical-device-vigilance-policy', description: 'Policy governing adverse event reporting and post-market surveillance for contact lenses, spectacle lenses, and hearing aids across all markets.', status: DocumentStatus.PUBLISHED, version: 2, businessAreaSlug: 'supply-chain', effectiveDate: new Date('2024-07-01'), reviewDate: new Date('2025-07-01') },
    { title: 'Modern Slavery & Supply Chain Policy', slug: 'modern-slavery-supply-chain-policy', description: 'Policy committing Specsavers to preventing modern slavery and human trafficking in business operations and supply chains for frames, lenses, and hearing aids.', status: DocumentStatus.PUBLISHED, version: 2, businessAreaSlug: 'supply-chain', effectiveDate: new Date('2024-10-01'), reviewDate: new Date('2025-10-01') },
    { title: 'Consumer Credit Policy', slug: 'consumer-credit-policy', description: 'Policy governing consumer credit operations for in-store finance on spectacles and hearing aids, ensuring FCA conduct compliance and Consumer Duty requirements.', status: DocumentStatus.PUBLISHED, version: 1, businessAreaSlug: 'finance-insurance', effectiveDate: new Date('2024-04-01'), reviewDate: new Date('2025-04-01') },
    { title: 'Advertising & Marketing Compliance Policy', slug: 'advertising-marketing-policy', description: 'Policy ensuring all advertising and marketing activities comply with ASA CAP Code, GOC advertising standards, and local advertising regulations in each market.', status: DocumentStatus.PUBLISHED, version: 2, businessAreaSlug: 'marketing-advertising', effectiveDate: new Date('2024-08-01'), reviewDate: new Date('2025-08-01') },
    { title: 'Environmental & Sustainability Policy', slug: 'environmental-sustainability-policy', description: 'Policy committing Specsavers to environmental sustainability, WEEE compliance, packaging waste obligations, and CSRD reporting readiness.', status: DocumentStatus.DRAFT, version: 1, businessAreaSlug: 'supply-chain', effectiveDate: null, reviewDate: null },
    { title: 'Health & Safety Policy', slug: 'health-safety-policy', description: 'Policy establishing health and safety standards across all store, laboratory, and office locations in compliance with HSWA 1974 and local H&S legislation.', status: DocumentStatus.PUBLISHED, version: 3, businessAreaSlug: 'human-resources', effectiveDate: new Date('2024-01-15'), reviewDate: new Date('2025-01-15') },
    { title: 'Cybersecurity Incident Response Policy', slug: 'cybersecurity-incident-response-policy', description: 'Policy establishing incident detection, response, and reporting procedures aligned with NIS2 24-hour notification requirements.', status: DocumentStatus.DRAFT, version: 1, businessAreaSlug: 'digital-technology', effectiveDate: null, reviewDate: null },
    { title: 'Whistleblowing Policy', slug: 'whistleblowing-policy', description: 'Policy providing a framework for Specsavers employees and joint venture partners to raise concerns about wrongdoing, malpractice, or regulatory breaches.', status: DocumentStatus.PUBLISHED, version: 2, businessAreaSlug: 'legal-compliance', effectiveDate: new Date('2024-04-01'), reviewDate: new Date('2025-04-01') },
  ];

  for (const p of policiesData) {
    await prisma.policy.create({
      data: {
        id: uuidv4(),
        title: p.title,
        slug: p.slug,
        description: p.description,
        status: p.status,
        version: p.version,
        businessAreaId: businessAreas[p.businessAreaSlug].id,
        effectiveDate: p.effectiveDate,
        reviewDate: p.reviewDate,
        ownerId: adminUser.id,
      },
    });
  }

  console.log('Policies seeded.');

  // ─── Risks ───────────────────────────────────────────────────────────────────

  const risksData = [
    { title: 'Patient data breach via store system compromise', description: 'Risk of unauthorised access to patient health data (special category) through compromised store clinical systems, triggering GDPR enforcement and ICO investigation.', likelihood: RiskLikelihood.POSSIBLE, consequence: RiskConsequence.MAJOR, status: RAGStatus.AMBER, categorySlug: 'data-protection', ownerId: managerUser.id },
    { title: 'GOC fitness to practise action against store', description: 'Risk of GOC fitness to practise action against registered professionals or business registration due to non-compliance with standards of practice.', likelihood: RiskLikelihood.UNLIKELY, consequence: RiskConsequence.MAJOR, status: RAGStatus.AMBER, categorySlug: 'optical-regulation', ownerId: analystUser.id },
    { title: 'Contact lens adverse event under-reporting', description: 'Risk of failing to report adverse events involving contact lenses to MHRA/TGA within required timeframes, leading to regulatory action and patient safety concerns.', likelihood: RiskLikelihood.POSSIBLE, consequence: RiskConsequence.MAJOR, status: RAGStatus.AMBER, categorySlug: 'medical-devices', ownerId: managerUser.id },
    { title: 'Ransomware attack on store network', description: 'Risk of ransomware attack disrupting clinical systems across store network, affecting patient care and triggering NIS2 incident reporting obligations.', likelihood: RiskLikelihood.POSSIBLE, consequence: RiskConsequence.CATASTROPHIC, status: RAGStatus.RED, categorySlug: 'digital-cybersecurity', ownerId: managerUser.id },
    { title: 'Modern slavery in frame supply chain', description: 'Risk of modern slavery practices identified within the frame or lens manufacturing supply chain, leading to legal liability and reputational damage.', likelihood: RiskLikelihood.UNLIKELY, consequence: RiskConsequence.MAJOR, status: RAGStatus.AMBER, categorySlug: 'modern-slavery', ownerId: analystUser.id },
    { title: 'FCA enforcement on consumer credit practices', description: 'Risk that in-store consumer credit practices do not meet FCA conduct standards or Consumer Duty requirements, resulting in enforcement action.', likelihood: RiskLikelihood.UNLIKELY, consequence: RiskConsequence.MAJOR, status: RAGStatus.AMBER, categorySlug: 'financial-services', ownerId: managerUser.id },
    { title: 'ASA ruling on advertising claims', description: 'Risk of ASA adverse ruling on advertising claims related to pricing, health claims, or promotional offers across optical and audiology services.', likelihood: RiskLikelihood.POSSIBLE, consequence: RiskConsequence.MODERATE, status: RAGStatus.AMBER, categorySlug: 'advertising-standards', ownerId: analystUser.id },
    { title: 'CQC non-compliance for domiciliary services', description: 'Risk of CQC inspection identifying non-compliance with fundamental standards for domiciliary or Newmedica services, leading to enforcement action.', likelihood: RiskLikelihood.POSSIBLE, consequence: RiskConsequence.MAJOR, status: RAGStatus.AMBER, categorySlug: 'healthcare-regulation', ownerId: managerUser.id },
    { title: 'Cross-border patient data transfer non-compliance', description: 'Risk of transferring patient data between Specsavers operating countries without adequate safeguards, violating GDPR Chapter V requirements.', likelihood: RiskLikelihood.POSSIBLE, consequence: RiskConsequence.MODERATE, status: RAGStatus.AMBER, categorySlug: 'data-protection', ownerId: analystUser.id },
    { title: 'GFSC insurance solvency breach', description: 'Risk that Guernsey-based insurance entities fail to maintain minimum solvency requirements, triggering GFSC intervention.', likelihood: RiskLikelihood.UNLIKELY, consequence: RiskConsequence.CATASTROPHIC, status: RAGStatus.GREEN, categorySlug: 'financial-services', ownerId: adminUser.id },
    { title: 'NIS2 incident notification failure', description: 'Risk that cybersecurity incident detection and escalation processes are too slow to meet the NIS2 24-hour notification requirement across European operations.', likelihood: RiskLikelihood.POSSIBLE, consequence: RiskConsequence.MAJOR, status: RAGStatus.AMBER, categorySlug: 'digital-cybersecurity', ownerId: managerUser.id },
  ];

  const risks: Record<string, any> = {};
  for (const r of risksData) {
    const risk = await prisma.risk.create({
      data: {
        id: uuidv4(),
        title: r.title,
        description: r.description,
        likelihood: r.likelihood,
        consequence: r.consequence,
        status: r.status,
        categoryId: categories[r.categorySlug].id,
        ownerId: r.ownerId,
      },
    });
    risks[r.title.substring(0, 25)] = risk;
  }

  // ─── Controls ────────────────────────────────────────────────────────────────

  const controlsData = [
    { title: 'Multi-factor authentication for clinical systems', description: 'MFA enforcement across all clinical and patient data systems in stores and corporate offices.', type: 'PREVENTIVE', ownerId: adminUser.id },
    { title: 'Role-based access control for patient records', description: 'RBAC implementation with principle of least privilege for all patient data and clinical systems.', type: 'PREVENTIVE', ownerId: adminUser.id },
    { title: 'Medical device vigilance reporting system', description: 'Centralised system for tracking and reporting adverse events for contact lenses, spectacle lenses, and hearing aids to relevant regulators.', type: 'DETECTIVE', ownerId: analystUser.id },
    { title: 'Store network endpoint detection and response', description: 'EDR solution deployed on all store and corporate endpoints with 24/7 SOC monitoring.', type: 'DETECTIVE', ownerId: managerUser.id },
    { title: 'Network segmentation between clinical and retail systems', description: 'Network segmentation isolating clinical patient data systems from POS and public Wi-Fi networks in stores.', type: 'PREVENTIVE', ownerId: managerUser.id },
    { title: 'Immutable backup for patient data systems', description: 'Air-gapped, immutable backup infrastructure for patient records tested quarterly for ransomware recovery.', type: 'CORRECTIVE', ownerId: adminUser.id },
    { title: 'Supply chain modern slavery due diligence programme', description: 'Structured programme for assessing modern slavery risks in frame, lens, and hearing aid supply chains including supplier audits.', type: 'PREVENTIVE', ownerId: analystUser.id },
    { title: 'GOC compliance monitoring programme', description: 'Periodic compliance checks across stores to ensure adherence to GOC Standards of Practice and business registration requirements.', type: 'DETECTIVE', ownerId: managerUser.id },
    { title: 'Automated cybersecurity incident detection and escalation', description: 'SIEM-based automated incident detection with escalation workflows to meet NIS2 24-hour notification requirements.', type: 'DETECTIVE', ownerId: managerUser.id },
    { title: 'Consumer credit quality assurance programme', description: 'Regular quality assurance reviews of consumer credit sales processes across stores to ensure FCA conduct compliance.', type: 'DETECTIVE', ownerId: analystUser.id },
  ];

  for (const c of controlsData) {
    await prisma.control.create({
      data: {
        id: uuidv4(),
        title: c.title,
        description: c.description,
        type: c.type,
        ownerId: c.ownerId,
      },
    });
  }

  console.log('Risks and controls seeded.');

  // ─── Impact Assessments ──────────────────────────────────────────────────────

  const impactAssessmentsData = [
    {
      regulationShortName: 'UK GDPR',
      assessorId: analystUser.id,
      overallImpact: ImpactLevel.HIGH,
      notes: 'DPIA - Centralised Patient Record System: Processing of special category health data at scale creates high risk. Lawful basis under Article 9(2)(h) (healthcare purposes) identified. Data minimisation and pseudonymisation measures recommended for analytics.',
    },
    {
      regulationShortName: 'UK GDPR',
      assessorId: analystUser.id,
      overallImpact: ImpactLevel.HIGH,
      notes: 'DPIA - Domiciliary Patient Data on Mobile Devices: High risk identified due to processing of patient health data on mobile devices during home visits. Recommended encryption, remote wipe capability, and strict access controls. Approved with conditions.',
      approvalStatus: ApprovalStatus.APPROVED,
    },
    {
      regulationShortName: 'EU AI Act',
      assessorId: analystUser.id,
      overallImpact: ImpactLevel.CRITICAL,
      notes: 'AI Impact Assessment - AI-Powered Retinal Screening Tool: System classified as high-risk AI under Annex III (medical devices). Requires conformity assessment, clinical validation data, transparency measures, and human oversight by qualified optometrists.',
    },
    {
      regulationShortName: 'CSRD',
      assessorId: managerUser.id,
      overallImpact: ImpactLevel.MEDIUM,
      notes: 'Sustainability Reporting Assessment - CSRD Readiness: Assessment of Specsavers EU operations against ESRS requirements. Identified gaps in Scope 3 emissions tracking across lens manufacturing and frame supply chain. Recommended establishing ESG data collection infrastructure.',
      approvalStatus: ApprovalStatus.APPROVED,
    },
  ];

  for (const ia of impactAssessmentsData) {
    await prisma.impactAssessment.create({
      data: {
        id: uuidv4(),
        regulationId: regulations[ia.regulationShortName].id,
        assessorId: ia.assessorId,
        overallImpact: ia.overallImpact,
        notes: ia.notes,
        approvalStatus: ia.approvalStatus || ApprovalStatus.PENDING,
      },
    });
  }

  console.log('Impact assessments seeded.');

  // ─── Workflows ───────────────────────────────────────────────────────────────

  const workflowsData = [
    {
      name: 'Regulation Change Approval',
      description: 'Workflow for reviewing, assessing impact, and approving regulatory changes before implementation across Specsavers operating countries.',
      trigger: WorkflowTrigger.REGULATION_UPDATED,
      ownerId: adminUser.id,
      actions: JSON.parse(JSON.stringify([
        { order: 1, name: 'Initial Review', assigneeRole: 'ANALYST', action: 'REVIEW', description: 'Review incoming regulatory change and summarise key impacts for Specsavers operations.' },
        { order: 2, name: 'Impact Assessment', assigneeRole: 'ANALYST', action: 'ASSESS', description: 'Conduct detailed impact assessment across affected business areas and operating countries.' },
        { order: 3, name: 'Stakeholder Review', assigneeRole: 'MANAGER', action: 'REVIEW', description: 'Review impact assessment with affected stakeholders including JV partners and agree remediation plan.' },
        { order: 4, name: 'Compliance Approval', assigneeRole: 'ADMIN', action: 'APPROVE', description: 'Final compliance approval and implementation authorisation.' },
      ])),
    },
    {
      name: 'Policy Review and Approval',
      description: 'Workflow for periodic policy review, update, and approval before publication across the Specsavers group.',
      trigger: WorkflowTrigger.POLICY_EXPIRING,
      ownerId: adminUser.id,
      actions: JSON.parse(JSON.stringify([
        { order: 1, name: 'Draft Update', assigneeRole: 'ANALYST', action: 'DRAFT', description: 'Update policy document with required changes reflecting latest regulatory requirements.' },
        { order: 2, name: 'Legal Review', assigneeRole: 'MANAGER', action: 'REVIEW', description: 'Legal review of policy changes for regulatory alignment across all operating jurisdictions.' },
        { order: 3, name: 'Management Approval', assigneeRole: 'ADMIN', action: 'APPROVE', description: 'Management sign-off on updated policy.' },
        { order: 4, name: 'Publish and Communicate', assigneeRole: 'ANALYST', action: 'PUBLISH', description: 'Publish updated policy and notify affected staff and JV partners.' },
      ])),
    },
    {
      name: 'Cybersecurity Incident Response',
      description: 'Workflow for responding to cybersecurity incidents affecting patient data or clinical systems, aligned with NIS2 notification requirements.',
      trigger: WorkflowTrigger.RISK_THRESHOLD,
      ownerId: managerUser.id,
      actions: JSON.parse(JSON.stringify([
        { order: 1, name: 'Incident Triage', assigneeRole: 'ANALYST', action: 'TRIAGE', description: 'Assess incident severity and classify. Determine if patient data or clinical systems are affected.' },
        { order: 2, name: 'Investigation', assigneeRole: 'ANALYST', action: 'INVESTIGATE', description: 'Investigate root cause and determine scope of impact across stores and systems.' },
        { order: 3, name: 'Regulatory Notification', assigneeRole: 'MANAGER', action: 'NOTIFY', description: 'Submit NIS2 notification within 24 hours and ICO notification within 72 hours if personal data affected.' },
        { order: 4, name: 'Remediation', assigneeRole: 'MANAGER', action: 'REMEDIATE', description: 'Implement remediation measures and verify effectiveness across affected locations.' },
        { order: 5, name: 'Post-Incident Review', assigneeRole: 'ADMIN', action: 'REVIEW', description: 'Conduct post-incident review and update controls as needed.' },
      ])),
    },
    {
      name: 'Audit Finding Remediation',
      description: 'Workflow for tracking and resolving audit findings from internal and external audits through to closure.',
      trigger: WorkflowTrigger.ACTION_OVERDUE,
      ownerId: managerUser.id,
      actions: JSON.parse(JSON.stringify([
        { order: 1, name: 'Finding Acknowledgement', assigneeRole: 'MANAGER', action: 'ACKNOWLEDGE', description: 'Acknowledge finding and assign remediation owner.' },
        { order: 2, name: 'Remediation Plan', assigneeRole: 'ANALYST', action: 'PLAN', description: 'Develop detailed remediation plan with timelines.' },
        { order: 3, name: 'Implementation', assigneeRole: 'ANALYST', action: 'IMPLEMENT', description: 'Implement remediation actions per approved plan.' },
        { order: 4, name: 'Validation', assigneeRole: 'MANAGER', action: 'VALIDATE', description: 'Validate remediation effectiveness and close finding.' },
      ])),
    },
  ];

  for (const w of workflowsData) {
    await prisma.workflow.create({
      data: {
        id: uuidv4(),
        name: w.name,
        description: w.description,
        trigger: w.trigger,
        actions: w.actions,
        ownerId: w.ownerId,
      },
    });
  }

  console.log('Workflows seeded.');

  // ─── Notifications ───────────────────────────────────────────────────────────

  const notificationsData = [
    { userId: adminUser.id, title: 'GOC Standards Update Published', message: 'The GOC has published updated Standards of Practice guidance. Review required for all optical practices.', type: NotificationType.REGULATION_UPDATE, isRead: false },
    { userId: adminUser.id, title: 'Audit finding requires attention', message: 'High-severity finding "Incomplete patient data processing inventory" from Q1 Patient Data Audit is overdue for remediation.', type: NotificationType.SYSTEM_ALERT, isRead: false },
    { userId: analystUser.id, title: 'Task assigned to you', message: 'You have been assigned the task "Map all medical devices across EU and UK markets" in the Medical Device Regulation Transition project.', type: NotificationType.TASK_ASSIGNED, isRead: true },
    { userId: analystUser.id, title: 'Obligation deadline approaching', message: 'The obligation "NIS2 Cybersecurity Risk Assessment" is due in 30 days.', type: NotificationType.TASK_OVERDUE, isRead: false },
    { userId: managerUser.id, title: 'Policy review due', message: 'The "Clinical Governance Policy" is due for annual review by March 2025.', type: NotificationType.DOCUMENT_EXPIRING, isRead: false },
    { userId: managerUser.id, title: 'Project milestone approaching', message: 'The milestone "NIS2 Gap Assessment Complete" is due on April 30, 2025.', type: NotificationType.SYSTEM_ALERT, isRead: false },
    { userId: adminUser.id, title: 'MHRA Medical Device Alert', message: 'MHRA has issued a Field Safety Notice affecting a contact lens product. Immediate review required.', type: NotificationType.REGULATION_UPDATE, isRead: true },
    { userId: analystUser.id, title: 'New ICO guidance published', message: 'ICO has issued new guidance on processing health data for research purposes that may affect patient analytics activities.', type: NotificationType.REGULATION_UPDATE, isRead: false },
    { userId: managerUser.id, title: 'Workflow approval required', message: 'A regulation change approval workflow for NIS2 implementation is waiting for your review and sign-off.', type: NotificationType.APPROVAL_REQUIRED, isRead: false },
    { userId: adminUser.id, title: 'Weekly compliance digest', message: 'Your weekly compliance digest is ready. 3 new regulatory updates tracked, 2 obligations approaching deadline, 1 audit finding overdue.', type: NotificationType.SYSTEM_ALERT, isRead: false },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
      },
    });
  }

  console.log('Notifications seeded.');

  // ─── Activity Logs ───────────────────────────────────────────────────────────

  const activityLogsData = [
    { userId: adminUser.id, action: 'CREATE', entityType: 'REGULATION', entityId: 'seed-reg-1' },
    { userId: adminUser.id, action: 'CREATE', entityType: 'REGULATION', entityId: 'seed-reg-2' },
    { userId: adminUser.id, action: 'CREATE', entityType: 'PROJECT', entityId: 'seed-proj-1' },
    { userId: analystUser.id, action: 'UPDATE', entityType: 'TASK', entityId: 'seed-task-1' },
    { userId: managerUser.id, action: 'APPROVE', entityType: 'POLICY', entityId: 'seed-policy-1' },
    { userId: analystUser.id, action: 'CREATE', entityType: 'AUDIT', entityId: 'seed-audit-1' },
    { userId: analystUser.id, action: 'CREATE', entityType: 'FINDING', entityId: 'seed-finding-1' },
    { userId: managerUser.id, action: 'UPDATE', entityType: 'RISK', entityId: 'seed-risk-1' },
    { userId: adminUser.id, action: 'CREATE', entityType: 'OBLIGATION', entityId: 'seed-obl-1' },
    { userId: analystUser.id, action: 'CREATE', entityType: 'IMPACT_ASSESSMENT', entityId: 'seed-ia-1' },
    { userId: adminUser.id, action: 'UPDATE', entityType: 'WORKFLOW', entityId: 'seed-wf-1' },
    { userId: managerUser.id, action: 'CREATE', entityType: 'PROJECT', entityId: 'seed-proj-2' },
    { userId: analystUser.id, action: 'UPDATE', entityType: 'OBLIGATION', entityId: 'seed-obl-2' },
    { userId: adminUser.id, action: 'CREATE', entityType: 'CONTROL', entityId: 'seed-ctrl-1' },
    { userId: managerUser.id, action: 'UPDATE', entityType: 'AUDIT', entityId: 'seed-audit-2' },
  ];

  for (const log of activityLogsData) {
    await prisma.activityLog.create({
      data: {
        id: uuidv4(),
        userId: log.userId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
      },
    });
  }

  console.log('Activity logs seeded.');

  // ─── AI Logs ─────────────────────────────────────────────────────────────────

  const aiLogsData = [
    {
      userId: analystUser.id,
      action: 'REGULATION_ANALYSIS',
      model: 'gpt-4-turbo',
      prompt: 'Analyse the EU Medical Devices Regulation 2017/745 and identify key compliance obligations for an optical retail company supplying contact lenses and spectacle lenses across EU markets.',
      response: 'Based on the EU MDR 2017/745, key obligations for optical retail companies include: 1) Unique Device Identification (UDI) for all devices placed on the EU market, 2) Post-market surveillance system with proactive monitoring, 3) Vigilance reporting - serious incidents must be reported to the competent authority within 15 days, 4) Economic operator obligations as a distributor including verifying CE marking and UDI, 5) Traceability requirements through supply chain, 6) Implant card requirements for contact lenses classified as implantable devices, 7) Registration in EUDAMED database. Contact lenses are classified as Class IIa or IIb depending on type. Spectacle lenses are Class I. Recommend immediate UDI implementation project.',
      totalTokens: 1847,
      latency: 3200,
    },
    {
      userId: analystUser.id,
      action: 'OBLIGATION_EXTRACTION',
      model: 'gpt-4-turbo',
      prompt: 'Extract specific compliance obligations from the GOC Standards of Practice for optical business registrants operating a multi-site retail chain.',
      response: 'Key GOC Standards of Practice obligations for multi-site optical businesses: 1) Standard 1: Ensure all patient interactions put patient safety first, 2) Standard 4: Maintain adequate professional indemnity insurance, 3) Standard 10: Keep full and accurate patient records contemporaneously, 4) Standard 11: Maintain patient confidentiality, 5) Standard 15: Ensure advertising is not misleading and complies with GOC guidance, 6) Standard 16: Maintain adequate clinical governance arrangements, 7) Standard 17: Ensure adequate supervision of students and trainees, 8) Standard 18: Cooperate with GOC investigations, 9) Business registrants must ensure systems and processes support registrants in meeting all 19 standards. CPD requirements: 36 points over 3 years for optometrists.',
      totalTokens: 1523,
      latency: 2800,
    },
    {
      userId: managerUser.id,
      action: 'IMPACT_ASSESSMENT',
      model: 'gpt-4-turbo',
      prompt: 'Assess the potential impact of NIS2 on Specsavers operations, focusing on healthcare sector obligations and incident reporting requirements.',
      response: 'NIS2 introduces significant changes for healthcare entities: 1) SCOPE: Healthcare is listed in Annex I as an essential sector. Specsavers likely qualifies given its size and healthcare activities across EU member states. 2) INCIDENT REPORTING: Must submit initial notification within 24 hours, full incident notification within 72 hours, and final report within one month. This applies per member state where operations exist. 3) MANAGEMENT LIABILITY: Article 20 makes management bodies personally liable for ensuring compliance. Board members can face personal sanctions. 4) SUPPLY CHAIN SECURITY: Must assess and manage risks from ICT supply chain including store technology vendors, clinical system providers, and cloud services. 5) MULTI-JURISDICTION: Compliance required in each EU member state (NL, DK, SE, NO, FI) separately. Recommend immediate gap assessment across all EU operations and board awareness training.',
      totalTokens: 1689,
      latency: 3100,
    },
    {
      userId: analystUser.id,
      action: 'DOCUMENT_SUMMARISATION',
      model: 'gpt-4-turbo',
      prompt: 'Summarise the key requirements of the Guernsey Data Protection Law 2017 and how it compares to the UK GDPR for a company headquartered in Guernsey.',
      response: 'Key requirements of the Guernsey DPL 2017: 1) GDPR-ALIGNED: Largely mirrors EU GDPR provisions including lawful processing conditions, data subject rights, and breach notification. 2) ADEQUACY: Guernsey has EU adequacy status, facilitating data transfers. 3) DPA ROLE: The ODPA (Office of Data Protection Authority) is the supervisory authority with enforcement powers. 4) DIFFERENCES FROM UK GDPR: Guernsey law has its own provisions for international transfers separate from UK adequacy decisions. The ODPA has slightly different enforcement procedures. 5) HQ IMPLICATIONS: As Specsavers is headquartered in Guernsey, the ODPA is a key regulator. Data processing activities at HQ including central support functions must comply with Guernsey law. 6) CROSS-BORDER: Transfers to UK, EU, and other jurisdictions require appropriate safeguards unless adequacy exists. Recommend reviewing all HQ data processing activities against Guernsey-specific requirements.',
      totalTokens: 1456,
      latency: 2950,
    },
    {
      userId: adminUser.id,
      action: 'RISK_ASSESSMENT',
      model: 'gpt-4-turbo',
      prompt: 'Evaluate the modern slavery risk in Specsavers supply chain, focusing on frame manufacturing, lens production, and hearing aid supply.',
      response: 'RISK ASSESSMENT SUMMARY - Modern Slavery Supply Chain Risk: OVERALL RISK: MEDIUM. Key risk areas by product: 1) FRAMES: Higher risk - many frames manufactured in China and Italy. Chinese manufacturing has elevated modern slavery risk indicators. Due diligence needed on sub-tier suppliers. 2) SPECTACLE LENSES: Lower risk - primarily manufactured in Vision Labs facilities (controlled) or sourced from major manufacturers (Essilor/Hoya) with established compliance programmes. 3) CONTACT LENSES: Lower risk - sourced from major manufacturers (J&J, Alcon, CooperVision) with established supply chain governance. 4) HEARING AIDS: Lower risk - sourced from established manufacturers (Sonova, Demant, WS Audiology) primarily manufacturing in Europe. 5) PACKAGING/ACCESSORIES: Medium risk - diverse supply chain with some components from higher-risk regions. Recommend: tier 1 supplier audits for frames, questionnaire-based assessment for other categories, and modern slavery training for procurement teams.',
      totalTokens: 2034,
      latency: 3500,
    },
  ];

  for (const log of aiLogsData) {
    await prisma.aILog.create({
      data: {
        id: uuidv4(),
        userId: log.userId,
        action: log.action,
        model: log.model,
        prompt: log.prompt,
        response: log.response,
        totalTokens: log.totalTokens,
        latency: log.latency,
      },
    });
  }

  console.log('AI logs seeded.');

  console.log('Database seeding completed successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
