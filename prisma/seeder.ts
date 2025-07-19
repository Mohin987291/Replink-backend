import { PrismaClient } from '../generated/prisma/index.js';
import { faker } from '@faker-js/faker';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

// Indonesian cities with their coordinates
const INDONESIAN_LOCATIONS = [
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
  { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
  { name: 'Medan', lat: 3.5952, lng: 98.6722 },
  { name: 'Semarang', lat: -6.9667, lng: 110.4167 },
  { name: 'Makassar', lat: -5.1477, lng: 119.4327 },
  { name: 'Palembang', lat: -2.9761, lng: 104.7754 },
  { name: 'Tangerang', lat: -6.1783, lng: 106.6319 },
  { name: 'Bekasi', lat: -6.2383, lng: 106.9756 },
  { name: 'Depok', lat: -6.4025, lng: 106.7942 },
  { name: 'Bogor', lat: -6.5971, lng: 106.8060 },
  { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
  { name: 'Malang', lat: -7.9666, lng: 112.6326 },
  { name: 'Denpasar', lat: -8.6500, lng: 115.2167 },
  { name: 'Balikpapan', lat: -1.2379, lng: 116.8529 },
];

// Function to generate coordinates near a specific location (within ~5km radius)
function generateNearbyCoordinates(baseLat: number, baseLng: number, radiusKm: number = 5) {
  const radius = radiusKm * 0.009; // Convert km to approximate degrees
  const deltaLat = (Math.random() - 0.5) * 2 * radius;
  const deltaLng = (Math.random() - 0.5) * 2 * radius;
  
  return {
    lat: baseLat + deltaLat,
    lng: baseLng + deltaLng
  };
}

// Indonesian pharmaceutical company names
const PHARMACEUTICAL_COMPANIES = [
  'PT Kimia Farma',
  'PT Kalbe Farma',
  'PT Sanbe Farma',
  'PT Indofarma',
  'PT Dexa Medica',
  'PT Combiphar',
  'PT Hexpharm Jaya',
  'PT Bernofarm',
  'PT Tempo Scan Pacific',
  'PT Soho Industri Pharmasi',
  'PT Guardian Pharmatama',
  'PT Mahakam Beta Farma',
  'PT Pyridam Farma',
  'PT Pharos Indonesia',
  'PT Novell Pharmaceutical',
];

// Indonesian names
const INDONESIAN_FIRST_NAMES = [
  'Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gilang', 'Hani', 'Indra', 'Joko',
  'Kartika', 'Lestari', 'Made', 'Novi', 'Oki', 'Putri', 'Qori', 'Rini', 'Sari', 'Tono',
  'Udin', 'Vera', 'Wati', 'Yuni', 'Zaki', 'Agus', 'Bambang', 'Cahya', 'Dian', 'Endang',
];

const INDONESIAN_LAST_NAMES = [
  'Pratama', 'Sari', 'Wijaya', 'Kurniawan', 'Lestari', 'Santoso', 'Fitriani', 'Setiawan',
  'Rahayu', 'Handoko', 'Susanti', 'Permana', 'Maharani', 'Gunawan', 'Anggraini', 'Nugroho',
  'Puspita', 'Wibowo', 'Dewanti', 'Hakim', 'Safitri', 'Utomo', 'Kartini', 'Sutrisno',
];

// Medical facilities types for visiting
const MEDICAL_FACILITIES = [
  'Rumah Sakit Umum', 'Rumah Sakit Swasta', 'Klinik Umum', 'Klinik Spesialis',
  'Puskesmas', 'Apotek', 'Praktek Dokter', 'Laboratorium Klinik',
  'Rumah Sakit Ibu dan Anak', 'Klinik Kecantikan', 'Klinik Gigi',
];

// Medical product categories
const MEDICAL_PRODUCTS = [
  'Antibiotik', 'Vitamin & Suplemen', 'Obat Jantung', 'Obat Diabetes',
  'Obat Hipertensi', 'Analgesik', 'Antihistamin', 'Obat Batuk & Flu',
  'Obat Maag', 'Obat Mata', 'Skincare Medical', 'Vaksin',
  'Alat Kesehatan', 'Medical Device', 'Nutrisi Parenteral',
];

function generateIndonesianName(): string {
  const firstName = faker.helpers.arrayElement(INDONESIAN_FIRST_NAMES);
  const lastName = faker.helpers.arrayElement(INDONESIAN_LAST_NAMES);
  return `${firstName} ${lastName}`;
}

function generatePharmaceuticalCompanyName(): string {
  return faker.helpers.arrayElement(PHARMACEUTICAL_COMPANIES);
}

function generateMedicalVisitTitle(): string {
  const facility = faker.helpers.arrayElement(MEDICAL_FACILITIES);
  const product = faker.helpers.arrayElement(MEDICAL_PRODUCTS);
  return `Kunjungan ${facility} - Promosi ${product}`;
}

function generateMedicalVisitDescription(title: string, location: string): string {
  const product = faker.helpers.arrayElement(MEDICAL_PRODUCTS);
  const facility = faker.helpers.arrayElement(MEDICAL_FACILITIES);
  
  const descriptions = [
    `Diperlukan medical representative untuk melakukan kunjungan ke ${facility} di area ${location}. Tugas meliputi presentasi produk ${product}, memberikan sampel, dan membangun hubungan dengan tenaga medis.`,
    `Lowongan kunjungan medis ke ${facility} wilayah ${location}. Rep akan melakukan edukasi tentang ${product} kepada dokter dan apoteker. Pengalaman di bidang farmasi diutamakan.`,
    `Dibutuhkan medical rep berpengalaman untuk visit ${facility} di ${location}. Kegiatan meliputi product detailing ${product}, follow up order, dan customer relationship management.`,
    `Kunjungan rutin ke ${facility} area ${location}. Medical representative akan melakukan promosi ${product}, training product knowledge, dan memaintain good relationship dengan healthcare professionals.`,
  ];
  
  return faker.helpers.arrayElement(descriptions);
}

async function main() {
  console.log('🌱 Starting pharmaceutical seeding process...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.reports.deleteMany();
  await prisma.applications.deleteMany();
  await prisma.gigs.deleteMany();
  await prisma.reps.deleteMany();
  await prisma.companies.deleteMany();

  // Create Pharmaceutical Companies with properly hashed passwords
  console.log('💊 Creating pharmaceutical companies...');
  const companies = [];
  for (let i = 0; i < 15; i++) {
    const hashedPassword = await bcryptjs.hash('password123', 10);
    const company = await prisma.companies.create({
      data: {
        name: generatePharmaceuticalCompanyName(),
        email: `pharma${i + 1}@example.com`,
        password: hashedPassword,
      },
    });
    companies.push(company);
  }

  // Create Medical Representatives with properly hashed passwords
  console.log('👨‍⚕️ Creating medical representatives...');
  const reps = [];
  for (let i = 0; i < 50; i++) {
    const hashedPassword = await bcryptjs.hash('password123', 10);
    const rep = await prisma.reps.create({
      data: {
        name: generateIndonesianName(),
        email: `medrep${i + 1}@example.com`,
        password: hashedPassword,
        isVerified: faker.datatype.boolean(0.85),
        isPassed: faker.datatype.boolean(0.75),
      },
    });
    reps.push(rep);
  }

  // Create Medical Visit Gigs (initially all ACTIVE)
  console.log('🏥 Creating medical visit gigs...');
  const gigs = [];
  for (let i = 0; i < 100; i++) {
    const location = faker.helpers.arrayElement(INDONESIAN_LOCATIONS);
    const nearbyCoords = generateNearbyCoordinates(location.lat, location.lng);
    const title = generateMedicalVisitTitle();
    
    const gig = await prisma.gigs.create({
      data: {
        title,
        description: generateMedicalVisitDescription(title, location.name),
        price: faker.number.float({ min: 200000, max: 1500000, fractionDigits: 0 }),
        status: 'ACTIVE', // All gigs start as ACTIVE
        latitude: nearbyCoords.lat,
        longitude: nearbyCoords.lng,
        Location: `${location.name}, Indonesia`,
        companyId: faker.helpers.arrayElement(companies).id,
      },
    });
    gigs.push(gig);
  }

  // Create Applications and update gig status when accepted
  console.log('📋 Creating applications (only one accepted per gig)...');
  const applications: any = [];
  const gigsWithAcceptedApplications = new Set();
  const gigsToMakeInactive: string[] = []; // Track gigs that should become INACTIVE

  for (let i = 0; i < 200; i++) {
    const gig = faker.helpers.arrayElement(gigs);
    const rep = faker.helpers.arrayElement(reps);
    
    // Avoid duplicate applications (same rep applying to same gig)
    const existingApplication = applications.find(
      (app: any) => app.gigId === gig.id && app.repId === rep.id
    );
    
    if (!existingApplication) {
      // Determine application status
      let status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
      
      if (gigsWithAcceptedApplications.has(gig.id)) {
        // This gig already has an accepted application, so this can only be PENDING or REJECTED
        status = faker.helpers.arrayElement(['PENDING', 'REJECTED']);
      } else {
        // This gig doesn't have an accepted application yet
        const randomStatus = faker.helpers.arrayElement(['PENDING', 'ACCEPTED', 'REJECTED']);
        
        if (randomStatus === 'ACCEPTED') {
          // Mark this gig as having an accepted application
          gigsWithAcceptedApplications.add(gig.id);
          // Mark this gig to be made INACTIVE
          gigsToMakeInactive.push(gig.id);
        }
        
        status = randomStatus;
      }

      const application = await prisma.applications.create({
        data: {
          gigId: gig.id,
          repId: rep.id,
          status,
        },
      });
      applications.push(application);
    }
  }

  // Update gigs with accepted applications to INACTIVE status
  console.log('🔄 Updating accepted gigs to INACTIVE status...');
  for (const gigId of gigsToMakeInactive) {
    await prisma.gigs.update({
      where: { id: gigId },
      data: { status: 'INACTIVE' },
    });
  }

  // Create Visit Reports - only for ACCEPTED applications
  console.log('📝 Creating visit reports (only for accepted applications)...');
  const acceptedApplications = applications.filter((app: any) => app.status === 'ACCEPTED');
  
  // Create reports for some of the accepted applications (representing completed visits)
  const reportsToCreate = Math.min(acceptedApplications.length, 30);
  
  for (let i = 0; i < reportsToCreate; i++) {
    const application = acceptedApplications[i];
    const gig = gigs.find(g => g.id === application.gigId);
    const company = companies.find(c => c.id === gig?.companyId);
    
    if (gig && company) {
      // Generate report location very close to the gig location (within 500m)
      const reportCoords = generateNearbyCoordinates(gig.latitude, gig.longitude, 0.5); // 0.5km radius
      
      const visitReports = [
        `Visit berhasil dilakukan di ${gig.Location}. Dokter memberikan respon positif terhadap product presentation. Follow up diperlukan minggu depan.`,
        `Kunjungan ke fasilitas kesehatan selesai dilaksanakan. Sampel produk telah diserahkan kepada apoteker. Koordinat kunjungan: ${reportCoords.lat.toFixed(6)}, ${reportCoords.lng.toFixed(6)}`,
        `Meeting dengan tim medis berjalan lancar. Product detailing telah disampaikan dengan baik. Ada potensi order untuk bulan depan.`,
        `Visit report: Presentasi produk kepada dokter spesialis berhasil. Dokumentasi kunjungan terlampir. Lokasi terverifikasi sesuai dengan assignment.`,
        `Kunjungan medis selesai dilakukan sesuai jadwal. Customer menunjukkan interest yang tinggi terhadap produk baru. Akan ada follow up visit.`,
        `Report kunjungan: Edukasi produk kepada tenaga medis berhasil dilakukan. Feedback positif diterima. Koordinat visit telah diverifikasi.`,
        `Visit completed successfully. Product knowledge sharing dengan pharmacist berjalan baik. Sample distribution selesai dilakukan.`,
        `Medical visit report: Diskusi dengan dokter mengenai clinical benefit produk. Respon sangat positif dan ada kemungkinan trial penggunaan.`,
      ];

      // Generate image URL for medical visit documentation
      const imageCategories = ['medical', 'business', 'healthcare', 'office', 'meeting'];
      const imageCategory = faker.helpers.arrayElement(imageCategories);
      const imageUrl = `https://picsum.photos/800/600?random=${i}&category=${imageCategory}&sig=medicalvisit${i}`;

      await prisma.reports.create({
        data: {
          companyId: company.id, // Include companyId as required by schema
          gigId: application.gigId,
          repId: application.repId,
          reason: faker.helpers.arrayElement(visitReports),
          imageUrl: imageUrl, // Now required, always provide an image
          latitude: reportCoords.lat, // Report location near gig location
          longitude: reportCoords.lng, // Report location near gig location
          location: `Near ${gig.Location}`, // Descriptive location
        },
      });
    }
  }

  // Calculate final statistics
  const acceptedCount = applications.filter((app: any) => app.status === 'ACCEPTED').length;
  const pendingCount = applications.filter((app: any) => app.status === 'PENDING').length;
  const rejectedCount = applications.filter((app: any) => app.status === 'REJECTED').length;
  
  const activeGigs = await prisma.gigs.count({ where: { status: 'ACTIVE' } });
  const inactiveGigs = await prisma.gigs.count({ where: { status: 'INACTIVE' } });

  console.log('✅ Pharmaceutical seeding completed successfully!');
  console.log(`📊 Created:
    - ${companies.length} pharmaceutical companies
    - ${reps.length} medical representatives  
    - ${gigs.length} medical visit gigs:
      • ${activeGigs} ACTIVE (available for applications)
      • ${inactiveGigs} INACTIVE (already assigned)
    - ${applications.length} applications:
      • ${acceptedCount} ACCEPTED (max 1 per gig)
      • ${pendingCount} PENDING
      • ${rejectedCount} REJECTED
    - ${reportsToCreate} visit reports (only from accepted applications)`);
    
  console.log(`🔐 All passwords are hashed with bcrypt salt rounds: 10`);
  console.log(`📧 Login credentials: email: pharma1@example.com, password: password123`);
  console.log(`👨‍⚕️ Rep login: email: medrep1@example.com, password: password123`);
  console.log(`📍 All reports are located within 500m of their respective gig locations`);
  console.log(`📸 All reports now include mandatory images for visit documentation`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });