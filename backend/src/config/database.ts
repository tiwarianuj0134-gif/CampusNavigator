/**
 * Database Connection + Auto-Seed (100+ Real Indian Colleges)
 * MongoDB Atlas: cluster0.9ssrofn
 * Retries up to 5 times. Server never crashes from DB failure.
 */
import mongoose from 'mongoose';
import config from './index.js';
import { logger } from '../utils/logger.js';

export const connectDatabase = async (): Promise<void> => {
  // Try direct URI first, then SRV fallback
  const uris = [
    config.MONGODB_URI,
    process.env.MONGODB_URI_SRV || '',
  ].filter(Boolean);

  for (const uri of uris) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const isSrv = uri.startsWith('mongodb+srv');
        logger.info(`🔌 Connecting (${isSrv ? 'SRV' : 'Direct'}) attempt ${attempt}/3...`);
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 20000,
          connectTimeoutMS: 25000,
          socketTimeoutMS: 45000,
          maxPoolSize: 20,
          minPoolSize: 2,
          retryWrites: true,
          retryReads: true,
          family: 4,
        });
        logger.info(`✅ MongoDB Connected → ${mongoose.connection.host} / ${mongoose.connection.name}`);
        await autoSeedIfEmpty();
        return;
      } catch (e: any) {
        logger.error(`❌ Attempt ${attempt} failed: ${e.message}`);
        if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
      }
    }
    logger.warn(`⚠️ All attempts failed for this URI, trying next...`);
  }
  logger.error('💀 All DB connection attempts failed — server running without database');
};

async function autoSeedIfEmpty() {
  try {
    const { College } = await import('../models/College.js');
    const count = await College.countDocuments();
    if (count > 0) {
      logger.info(`📊 Database already has ${count} colleges — skipping seed`);
      return;
    }
    logger.info('📭 Empty DB → Auto-seeding 100+ colleges...');
    await seedColleges();
    const finalCount = await College.countDocuments();
    logger.info(`🌱 Seed complete: ${finalCount} colleges inserted`);
  } catch (e: any) {
    logger.error(`Seed error: ${e.message}`);
  }
}

async function seedColleges() {
  const { College } = await import('../models/College.js');
  const { User } = await import('../models/User.js');

  // Create admin user if none exists
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@campusnavigator.in',
        password: 'Admin@1234',
        role: 'admin',
        isVerified: true,
      });
      logger.info('👤 Admin user created: admin@campusnavigator.in / Admin@1234');
    }
  } catch (_) {}

  const img = (p: string) => `https://images.unsplash.com/photo-${p}?w=800&q=80`;
  const now = new Date();

  type CollegeDoc = {
    name: string; shortName?: string; slug: string; description: string;
    type: 'Government' | 'Private' | 'Deemed' | 'Autonomous';
    established: number;
    address: { city: string; state: string; country: string; pincode?: string };
    coordinates?: { lat: number; lng: number };
    coverImage: string; logo?: string; images: string[];
    approvals: { aicte?: boolean; ugc?: boolean; naac?: { grade: string; score?: number }; nba?: boolean; nirf?: { rank: number; year: number; category: string }; other: string[] };
    streams: string[]; fees: { min: number; max: number };
    facilities: string[]; hostel: { boys: boolean; girls: boolean; capacity?: number };
    contact: { phone?: string[]; email?: string[]; website?: string };
    placements?: { enabled: boolean; averagePackage?: number; highestPackage?: number; medianPackage?: number; placementRate?: number; topRecruiters: string[] };
    rating: number; reviewCount: number;
    ratingBreakdown?: { academics: number; faculty: number; infrastructure: number; placements: number; campusLife: number };
    status: 'active'; tags: string[];
    createdAt: Date; updatedAt: Date;
  };

  const makeCollege = (
    name: string, shortName: string, slug: string, type: 'Government'|'Private'|'Deemed'|'Autonomous',
    year: number, city: string, state: string, pincode: string,
    lat: number, lng: number, streams: string[], fmin: number, fmax: number,
    naac: string, nirfRank: number, nirfCat: string,
    avgPkg: number, highPkg: number, placRate: number, recruiters: string[],
    rating: number, reviews: number, tags: string[], imgId: string,
    website: string, desc: string, aicte: boolean, ugc: boolean
  ): CollegeDoc => ({
    name, shortName, slug, description: desc, type, established: year,
    address: { city, state, country: 'India', pincode },
    coordinates: { lat, lng },
    coverImage: img(imgId), logo: '', images: [img(imgId)],
    approvals: {
      aicte, ugc,
      naac: naac ? { grade: naac } : undefined,
      nirf: nirfRank > 0 ? { rank: nirfRank, year: 2024, category: nirfCat } : undefined,
      other: [],
    },
    streams, fees: { min: fmin, max: fmax },
    facilities: ['Library', 'Labs', 'Hostel', 'WiFi', 'Cafeteria', 'Sports Complex'],
    hostel: { boys: true, girls: true },
    contact: { website },
    placements: { enabled: true, averagePackage: avgPkg, highestPackage: highPkg, placementRate: placRate, topRecruiters: recruiters },
    rating, reviewCount: reviews,
    ratingBreakdown: { academics: rating, faculty: rating - 0.1, infrastructure: rating - 0.2, placements: rating + 0.1 > 5 ? 5 : rating + 0.1, campusLife: rating - 0.1 },
    status: 'active', tags, createdAt: now, updatedAt: now,
  });

  const colleges: CollegeDoc[] = [
    // ── IITs ────────────────────────────────────────────────────────────────
    makeCollege('Indian Institute of Technology Madras','IIT Madras','iit-madras','Government',1959,'Chennai','Tamil Nadu','600036',12.9916,80.2336,['Engineering','Science','Management'],200000,1000000,'A++',1,'Engineering',2100000,20000000,97,['Google','Microsoft','Amazon','Intel','Samsung'],4.9,1400,['IIT','NIRF #1'],'1541339907198-e08756dedf3f','https://www.iitm.ac.in','IIT Madras is #1 ranked in NIRF Engineering. Established in 1959, it is a global leader in tech research and education.',true,true),
    makeCollege('Indian Institute of Technology Delhi','IIT Delhi','iit-delhi','Government',1961,'New Delhi','Delhi','110016',28.5459,77.1926,['Engineering','Science','Design','Management'],200000,1000000,'A++',2,'Engineering',2200000,21000000,98,['Google','Microsoft','Goldman Sachs','McKinsey','Apple'],4.8,1240,['IIT','Top 5'],'1562774053-701939374585','https://www.iitd.ac.in','IIT Delhi is one of India\'s premier engineering institutions known for cutting-edge research and exceptional placements.',true,true),
    makeCollege('Indian Institute of Technology Bombay','IIT Bombay','iit-bombay','Government',1958,'Mumbai','Maharashtra','400076',19.1334,72.9133,['Engineering','Science','Design','Management'],200000,1000000,'A++',3,'Engineering',2400000,25000000,97,['Google','Apple','Morgan Stanley','Uber','Adobe'],4.8,1350,['IIT','Top 3'],'1498243691581-b145c3f54a5a','https://www.iitb.ac.in','IIT Bombay ranks Top 3 among IITs. Known for producing global tech leaders and strong research output.',true,true),
    makeCollege('Indian Institute of Technology Kanpur','IIT Kanpur','iit-kanpur','Government',1959,'Kanpur','Uttar Pradesh','208016',26.5123,80.2329,['Engineering','Science','Management','Design'],200000,1000000,'A++',4,'Engineering',2000000,18000000,95,['Google','Microsoft','Samsung','Goldman Sachs','Uber'],4.7,980,['IIT','Top 5'],'1517245386807-bb43f82c33c4','https://www.iitk.ac.in','IIT Kanpur is known for strong Computer Science, Aerospace and Mechanical programs. Established 1959.',true,true),
    makeCollege('Indian Institute of Technology Kharagpur','IIT Kharagpur','iit-kharagpur','Government',1951,'Kharagpur','West Bengal','721302',22.3149,87.3105,['Engineering','Science','Management','Architecture','Law'],200000,1000000,'A++',5,'Engineering',1800000,22000000,93,['Google','Amazon','Microsoft','Flipkart'],4.7,1100,['IIT','First IIT'],'1523050854058-8df90110c476','https://www.iitkgp.ac.in','IIT Kharagpur — the first IIT (1951) — has the largest campus and offers the widest range of programs.',true,true),
    makeCollege('Indian Institute of Technology Roorkee','IIT Roorkee','iit-roorkee','Government',1847,'Roorkee','Uttarakhand','247667',29.8644,77.8964,['Engineering','Science','Architecture'],200000,1000000,'A++',8,'Engineering',1700000,15000000,92,['Google','Microsoft','Samsung','L&T'],4.6,900,['IIT','Oldest Technical'],'1607237138185-eedd9c632b0b','https://www.iitr.ac.in','IIT Roorkee (est. 1847) is Asia\'s oldest technical institute and one of the top IITs in India.',true,true),
    makeCollege('Indian Institute of Technology Guwahati','IIT Guwahati','iit-guwahati','Government',1994,'Guwahati','Assam','781039',26.1908,91.6970,['Engineering','Science','Design'],200000,1000000,'A++',7,'Engineering',1600000,14000000,91,['Google','Microsoft','Samsung','Adobe'],4.6,700,['IIT','Northeast India'],'1541339907198-e08756dedf3f','https://www.iitg.ac.in','IIT Guwahati, established in 1994, is one of the newer IITs with a rapidly rising national ranking.',true,true),
    makeCollege('Indian Institute of Technology Hyderabad','IIT Hyderabad','iit-hyderabad','Government',2008,'Hyderabad','Telangana','502285',17.5970,78.1319,['Engineering','Science','Design'],200000,1000000,'A+',6,'Engineering',1500000,15000000,90,['Google','Amazon','Microsoft','Qualcomm'],4.5,500,['IIT','AI Research'],'1517245386807-bb43f82c33c4','https://www.iith.ac.in','IIT Hyderabad is the fastest-rising IIT with a strong focus on AI/ML research and innovation.',true,true),
    makeCollege('Indian Institute of Technology BHU','IIT BHU','iit-bhu','Government',1919,'Varanasi','Uttar Pradesh','221005',25.2677,83.0055,['Engineering','Science','Pharmacy'],200000,1000000,'A++',11,'Engineering',1500000,12000000,89,['Google','Microsoft','Flipkart','TCS'],4.5,800,['IIT','Heritage'],'1607237138185-eedd9c632b0b','https://www.iitbhu.ac.in','IIT BHU Varanasi is a historic engineering institute within the Banaras Hindu University campus.',true,true),
    makeCollege('Indian Institute of Technology Dhanbad','IIT Dhanbad','iit-dhanbad','Government',1926,'Dhanbad','Jharkhand','826004',23.8140,86.4408,['Engineering','Science','Management'],200000,1000000,'A++',13,'Engineering',1400000,11000000,87,['Microsoft','TCS','L&T','ONGC'],4.4,600,['IIT','Mining'],'1523050854058-8df90110c476','https://www.iitism.ac.in','IIT (ISM) Dhanbad (est. 1926) is renowned for Mining, Petroleum and Mechanical Engineering programs.',true,true),
    makeCollege('Indian Institute of Technology Indore','IIT Indore','iit-indore','Government',2009,'Indore','Madhya Pradesh','453552',22.5203,75.9202,['Engineering','Science'],200000,1000000,'A+',10,'Engineering',1400000,13000000,88,['Google','Samsung','TCS','Infosys'],4.4,400,['IIT','Central India'],'1562774053-701939374585','https://www.iiti.ac.in','IIT Indore is a new-generation IIT with strong research output and rising national rankings.',true,true),
    makeCollege('Indian Institute of Technology Patna','IIT Patna','iit-patna','Government',2008,'Patna','Bihar','801106',25.5138,84.8492,['Engineering','Science'],200000,1000000,'A',21,'Engineering',1300000,10000000,85,['Amazon','Samsung','TCS','Cognizant'],4.3,350,['IIT','Bihar'],'1541339907198-e08756dedf3f','https://www.iitp.ac.in','IIT Patna is a growing IIT with strong engineering programs and improving placements year over year.',true,true),
    makeCollege('Indian Institute of Technology Mandi','IIT Mandi','iit-mandi','Government',2009,'Mandi','Himachal Pradesh','175005',31.7754,76.9861,['Engineering','Science'],200000,1000000,'A',23,'Engineering',1200000,9000000,82,['Samsung','TCS','Infosys','HCL'],4.2,250,['IIT','Himalayan'],'1498243691581-b145c3f54a5a','https://www.iitmandi.ac.in','IIT Mandi is set in the scenic Himalayan foothills of Himachal Pradesh with focus on sustainable tech.',true,true),
    makeCollege('Indian Institute of Technology Ropar','IIT Ropar','iit-ropar','Government',2008,'Rupnagar','Punjab','140001',30.9690,76.5298,['Engineering','Science'],200000,1000000,'A',22,'Engineering',1300000,10000000,84,['Amazon','Google','TCS','Wipro'],4.3,300,['IIT','Punjab'],'1517245386807-bb43f82c33c4','https://www.iitrpr.ac.in','IIT Ropar is a growing IIT in Punjab with focus on engineering research and innovation.',true,true),
    makeCollege('Indian Institute of Technology Bhubaneswar','IIT Bhubaneswar','iit-bhubaneswar','Government',2008,'Bhubaneswar','Odisha','752050',20.1487,85.6752,['Engineering','Science'],200000,1000000,'A',25,'Engineering',1200000,9000000,83,['TCS','Infosys','Amazon','Wipro'],4.3,280,['IIT','Odisha'],'1562774053-701939374585','https://www.iitbbs.ac.in','IIT Bhubaneswar is an emerging IIT in eastern India with rapidly improving research and placements.',true,true),
  ];

  // ── NITs ────────────────────────────────────────────────────────────────
  colleges.push(
    makeCollege('NIT Tiruchirappalli','NIT Trichy','nit-trichy','Government',1964,'Tiruchirappalli','Tamil Nadu','620015',10.7590,78.8148,['Engineering','Science','Architecture'],150000,600000,'A++',9,'Engineering',1200000,12000000,92,['Google','Microsoft','Amazon','TCS','Infosys'],4.5,750,['NIT','Top NIT'],'1517245386807-bb43f82c33c4','https://www.nitt.edu','NIT Trichy is the top-ranked NIT in NIRF. Excellent engineering programs and strong placements.',true,true),
    makeCollege('NIT Warangal','NIT Warangal','nit-warangal','Government',1959,'Warangal','Telangana','506004',17.9833,79.5300,['Engineering','Science','Management'],150000,600000,'A+',15,'Engineering',1100000,10000000,90,['Microsoft','Amazon','Google','Infosys'],4.4,600,['NIT','JEE Main'],'1541339907198-e08756dedf3f','https://www.nitw.ac.in','NIT Warangal, one of the first NITs established in 1959, has strong engineering and management programs.',true,true),
    makeCollege('NIT Karnataka Surathkal','NIT Surathkal','nit-surathkal','Government',1960,'Mangalore','Karnataka','575025',13.0109,74.7937,['Engineering','Science'],150000,600000,'A+',12,'Engineering',1300000,15000000,93,['Google','Amazon','Oracle','Samsung'],4.5,680,['NIT','Beach Campus'],'1498243691581-b145c3f54a5a','https://www.nitk.ac.in','NIT Surathkal has a scenic beach campus near Mangalore with excellent CS and engineering placements.',true,true),
    makeCollege('NIT Rourkela','NIT Rourkela','nit-rourkela','Government',1961,'Rourkela','Odisha','769008',22.2568,84.9021,['Engineering','Science','Management'],150000,600000,'A+',18,'Engineering',1000000,8000000,87,['TCS','Infosys','Amazon','L&T'],4.3,550,['NIT','JEE Main'],'1523050854058-8df90110c476','https://www.nitrkl.ac.in','NIT Rourkela is a top NIT in eastern India with strong core engineering programs and placements.',true,true),
    makeCollege('NIT Calicut','NIT Calicut','nit-calicut','Government',1961,'Kozhikode','Kerala','673601',11.3220,75.9363,['Engineering','Science','Architecture'],150000,600000,'A+',16,'Engineering',1000000,9000000,88,['TCS','Microsoft','Infosys','Wipro'],4.3,500,['NIT','Kerala'],'1562774053-701939374585','https://www.nitc.ac.in','NIT Calicut is the leading NIT in Kerala with strong engineering programs and campus life.',true,true),
    makeCollege('MNNIT Allahabad','MNNIT Allahabad','mnnit-allahabad','Government',1961,'Prayagraj','Uttar Pradesh','211004',25.4940,81.8636,['Engineering','Science','Management'],150000,600000,'A+',19,'Engineering',900000,8000000,85,['TCS','Infosys','Wipro','Microsoft'],4.3,480,['NIT','JEE Main'],'1607237138185-eedd9c632b0b','https://www.mnnit.ac.in','MNNIT Allahabad is a well-established NIT in Uttar Pradesh with strong academics and placements.',true,true),
    makeCollege('NIT Durgapur','NIT Durgapur','nit-durgapur','Government',1960,'Durgapur','West Bengal','713209',23.5204,87.3119,['Engineering','Science'],150000,600000,'A',24,'Engineering',800000,7000000,82,['TCS','Cognizant','Infosys','Wipro'],4.2,400,['NIT','West Bengal'],'1517245386807-bb43f82c33c4','https://www.nitdgp.ac.in','NIT Durgapur has a strong tradition in engineering education in West Bengal.',true,true),
    makeCollege('VNIT Nagpur','VNIT Nagpur','vnit-nagpur','Government',1960,'Nagpur','Maharashtra','440010',21.1249,79.0768,['Engineering','Science','Management'],150000,600000,'A+',20,'Engineering',900000,8000000,86,['TCS','Infosys','Amazon','L&T'],4.3,450,['NIT','Central India'],'1541339907198-e08756dedf3f','https://www.vnit.ac.in','VNIT Nagpur is the top NIT in central India with strong engineering programs.',true,true),
    makeCollege('NIT Jaipur (MNIT)','MNIT Jaipur','mnit-jaipur','Government',1963,'Jaipur','Rajasthan','302017',26.8589,75.7740,['Engineering','Science','Architecture'],150000,600000,'A+',27,'Engineering',900000,8000000,84,['TCS','Infosys','Wipro','KPMG'],4.3,420,['NIT','Rajasthan'],'1562774053-701939374585','https://www.mnit.ac.in','MNIT Jaipur is the leading NIT in Rajasthan with strong engineering and architecture programs.',true,true),
  );

  // ── IIITs ───────────────────────────────────────────────────────────────
  colleges.push(
    makeCollege('IIIT Hyderabad','IIIT Hyderabad','iiit-hyderabad','Deemed',1998,'Hyderabad','Telangana','500032',17.4449,78.3498,['Engineering','Science','Research'],300000,800000,'A',24,'Engineering',1600000,20000000,95,['Google','Microsoft','Apple','Uber','Adobe'],4.6,500,['IIIT','CS Research','AI/ML'],'1517245386807-bb43f82c33c4','https://www.iiit.ac.in','IIIT Hyderabad is India\'s top CS research institute known for AI/ML programs and exceptional placements.',true,true),
    makeCollege('IIIT Bangalore','IIIT Bangalore','iiit-bangalore','Deemed',1999,'Bangalore','Karnataka','560100',12.8432,77.6659,['Engineering','Science'],400000,900000,'A',30,'Engineering',1400000,15000000,92,['Google','Amazon','Microsoft','Flipkart'],4.5,350,['IIIT','IT Hub'],'1541339907198-e08756dedf3f','https://www.iiitb.ac.in','IIIT Bangalore offers strong IT and data science programs in India\'s Silicon Valley.',true,true),
    makeCollege('IIIT Allahabad','IIIT Allahabad','iiit-allahabad','Deemed',1999,'Prayagraj','Uttar Pradesh','211015',25.4977,81.8718,['Engineering','Science'],200000,500000,'A',35,'Engineering',1100000,12000000,88,['Google','Amazon','Samsung','TCS'],4.4,400,['IIIT','One of Oldest'],'1562774053-701939374585','https://www.iiita.ac.in','IIIT Allahabad is one of India\'s oldest IIITs with strong placement record in IT sector.',true,true),
    makeCollege('IIIT Delhi','IIIT Delhi','iiit-delhi','Government',2008,'New Delhi','Delhi','110020',28.5454,77.2731,['Engineering','Science'],300000,700000,'A+',29,'Engineering',1500000,17000000,93,['Google','Microsoft','Amazon','Uber'],4.5,380,['IIIT','Delhi','State Funded'],'1523050854058-8df90110c476','https://www.iiitd.ac.in','IIIT Delhi is a state-funded IIIT with excellent CS programs and strong industry connections.',true,true),
    makeCollege('ABV-IIITM Gwalior','IIITM Gwalior','iiitm-gwalior','Government',1997,'Gwalior','Madhya Pradesh','474015',26.2183,78.1828,['Engineering','Management'],150000,500000,'A',40,'Engineering',1000000,10000000,85,['TCS','Infosys','Amazon','Wipro'],4.3,300,['IIIT','IT Management'],'1607237138185-eedd9c632b0b','https://www.iiitm.ac.in','IIITM Gwalior pioneered the integration of IT and management education in India.',true,true),
  );

  // ── IIMs ───────────────────────────────────────────────────────────────
  colleges.push(
    makeCollege('IIM Bangalore','IIM Bangalore','iim-bangalore','Government',1973,'Bangalore','Karnataka','560076',12.9716,77.5946,['Business','Management'],2300000,2800000,'A++',1,'Management',3400000,12500000,100,['McKinsey','BCG','Bain','Amazon','Google','Goldman Sachs'],4.9,980,['IIM','#1 B-School','CAT'],'1523050854058-8df90110c476','https://www.iimb.ac.in','IIM Bangalore is India\'s #1 business school. Its PGP program is globally ranked with 100% placements.',true,true),
    makeCollege('IIM Ahmedabad','IIM Ahmedabad','iim-ahmedabad','Government',1961,'Ahmedabad','Gujarat','380015',23.0329,72.5274,['Business','Management'],2300000,2800000,'A++',2,'Management',3200000,11000000,100,['McKinsey','BCG','Bain','JP Morgan','Amazon'],4.9,850,['IIM','Top B-School','CAT'],'1580537659466-0a9bfa916a54','https://www.iima.ac.in','IIM Ahmedabad pioneered management education in India and remains among Asia\'s top business schools.',true,true),
    makeCollege('IIM Calcutta','IIM Calcutta','iim-calcutta','Government',1961,'Kolkata','West Bengal','700104',22.4965,88.3012,['Business','Management'],2300000,2700000,'A++',3,'Management',3100000,10000000,100,['McKinsey','Goldman Sachs','BCG','Deloitte'],4.8,780,['IIM','Finance','CAT'],'1551076805-e1869033e561','https://www.iimcal.ac.in','IIM Calcutta — the first IIM — is known for its rigorous finance and consulting specializations.',true,true),
    makeCollege('IIM Lucknow','IIM Lucknow','iim-lucknow','Government',1984,'Lucknow','Uttar Pradesh','226013',26.9124,80.9681,['Business','Management'],2100000,2500000,'A++',4,'Management',2800000,9000000,100,['McKinsey','Amazon','Deloitte','Bain'],4.7,600,['IIM','Top 5','CAT'],'1517245386807-bb43f82c33c4','https://www.iiml.ac.in','IIM Lucknow is a top-5 IIM with strong placements in consulting, finance and FMCG sectors.',true,true),
    makeCollege('IIM Kozhikode','IIM Kozhikode','iim-kozhikode','Government',1996,'Kozhikode','Kerala','673570',11.3780,75.9127,['Business','Management'],2100000,2500000,'A++',5,'Management',2700000,8500000,99,['McKinsey','Amazon','BCG','Deloitte'],4.7,550,['IIM','Kerala','CAT'],'1541339907198-e08756dedf3f','https://www.iimk.ac.in','IIM Kozhikode is a top IIM with a beautiful hillside campus and consistently strong placements.',true,true),
    makeCollege('IIM Indore','IIM Indore','iim-indore','Government',1996,'Indore','Madhya Pradesh','453556',22.7560,75.9107,['Business','Management'],2000000,2400000,'A++',6,'Management',2500000,8000000,98,['Amazon','Deloitte','EY','Bain'],4.6,500,['IIM','IPM','CAT'],'1562774053-701939374585','https://www.iimidr.ac.in','IIM Indore is known for its flagship PGP and innovative 5-year IPM integrated management program.',true,true),
    makeCollege('FMS Delhi','FMS Delhi','fms-delhi','Government',1954,'New Delhi','Delhi','110007',28.6889,77.2099,['Business','Management'],50000,100000,'A+',8,'Management',2800000,9000000,100,['McKinsey','BCG','Amazon','Google'],4.8,400,['FMS','Best ROI MBA','CAT'],'1562774053-701939374585','https://fms.edu','FMS Delhi offers the best ROI MBA in India. Under Delhi University with very low fees and top placements.',true,true),
    makeCollege('XLRI Jamshedpur','XLRI Jamshedpur','xlri-jamshedpur','Private',1949,'Jamshedpur','Jharkhand','831001',22.7962,86.1932,['Business','Management'],2200000,2600000,'A++',7,'Management',2600000,8000000,100,['McKinsey','BCG','Deloitte','EY'],4.7,450,['XLRI','HR Excellence','XAT'],'1580537659466-0a9bfa916a54','https://www.xlri.ac.in','XLRI Jamshedpur (est. 1949) is one of India\'s oldest B-schools known for strong HR programs.',false,true),
    makeCollege('Indian School of Business','ISB Hyderabad','isb-hyderabad','Private',2001,'Hyderabad','Telangana','500032',17.4259,78.3433,['Business','Management'],3900000,4200000,'',0,'Management',3400000,10000000,98,['McKinsey','BCG','Google','Goldman Sachs'],4.7,500,['ISB','GMAT','Global MBA'],'1523050854058-8df90110c476','https://www.isb.edu','ISB is globally ranked with AACSB and EQUIS accreditation. 1-year PGP MBA with top global placements.',true,false),
  );

  // ── Medical ─────────────────────────────────────────────────────────────
  colleges.push(
    makeCollege('All India Institute of Medical Sciences Delhi','AIIMS Delhi','aiims-delhi','Government',1956,'New Delhi','Delhi','110029',28.5672,77.2100,['Medical','Nursing','Research'],6000,50000,'A++',1,'Medical',1200000,5000000,100,['Apollo','Fortis','Max','WHO'],4.9,1100,['AIIMS','#1 Medical','NEET'],'1551076805-e1869033e561','https://www.aiims.edu','AIIMS Delhi — India\'s #1 medical institution — sets the gold standard for medical education and research.',false,true),
    makeCollege('AIIMS Jodhpur','AIIMS Jodhpur','aiims-jodhpur','Government',2012,'Jodhpur','Rajasthan','342005',26.2560,73.0243,['Medical','Nursing'],10000,60000,'A+',8,'Medical',1000000,3000000,98,['AIIMS Network','Govt Hospitals'],4.5,300,['AIIMS','NEET'],'1551076805-e1869033e561','https://www.aiimsjodhpur.edu.in','AIIMS Jodhpur is a new-generation AIIMS with modern infrastructure and top medical programs.',false,true),
    makeCollege('AIIMS Bhopal','AIIMS Bhopal','aiims-bhopal','Government',2012,'Bhopal','Madhya Pradesh','462020',23.2133,77.3893,['Medical','Nursing'],10000,60000,'A+',10,'Medical',1000000,3000000,97,['AIIMS Network','Govt Hospitals'],4.4,250,['AIIMS','NEET'],'1551076805-e1869033e561','https://www.aiimsbhopal.edu.in','AIIMS Bhopal provides world-class medical education in central India.',false,true),
    makeCollege('Christian Medical College Vellore','CMC Vellore','cmc-vellore','Private',1900,'Vellore','Tamil Nadu','632004',12.9253,79.1353,['Medical','Nursing','Allied Health'],50000,300000,'A++',3,'Medical',1000000,3000000,100,['Apollo','Global Hospitals'],4.8,650,['Top Medical','CMC','NEET'],'1551076805-e1869033e561','https://www.cmch-vellore.edu','CMC Vellore (est. 1900) is a legendary medical institution known for service and advanced research.',false,true),
    makeCollege('JIPMER Puducherry','JIPMER','jipmer-puducherry','Government',1823,'Puducherry','Puducherry','605006',11.9441,79.8128,['Medical','Nursing'],15000,100000,'A++',5,'Medical',1000000,2500000,100,['Govt Hospitals'],4.7,400,['JIPMER','NEET','Autonomous'],'1551076805-e1869033e561','https://www.jipmer.edu.in','JIPMER Puducherry (est. 1823) is one of India\'s oldest and most prestigious autonomous medical institutes.',false,true),
    makeCollege('Kasturba Medical College Manipal','KMC Manipal','kmc-manipal','Private',1953,'Manipal','Karnataka','576104',13.3544,74.7872,['Medical','Nursing'],500000,2000000,'A++',9,'Medical',900000,2500000,95,['Apollo','Manipal Hospitals'],4.5,500,['KMC','Private Medical','NEET'],'1551076805-e1869033e561','https://www.manipal.edu','KMC Manipal is India\'s top private medical college with international faculty and modern facilities.',false,true),
    makeCollege('Maulana Azad Medical College','MAMC Delhi','mamc-delhi','Government',1958,'New Delhi','Delhi','110002',28.6448,77.2213,['Medical'],20000,100000,'A+',6,'Medical',1100000,3000000,99,['Govt Hospitals','LNJP Hospital'],4.6,400,['MAMC','NEET','Delhi'],'1551076805-e1869033e561','https://www.mamc.ac.in','MAMC Delhi is a premier government medical college in Delhi with excellent clinical training.',false,true),
  );

  // ── Law ─────────────────────────────────────────────────────────────────
  colleges.push(
    makeCollege('National Law School of India University','NLSIU Bangalore','nlsiu-bangalore','Government',1987,'Bangalore','Karnataka','560072',13.0719,77.5009,['Law'],200000,700000,'A+',1,'Law',1800000,4500000,95,['Cyril Amarchand','AZB','Trilegal','Khaitan'],4.7,560,['NLU','#1 Law School','CLAT'],'1580537659466-0a9bfa916a54','https://www.nls.ac.in','NLSIU Bangalore is India\'s #1 law school. Pioneer of the 5-year BA LLB program.',false,true),
    makeCollege('NALSAR University of Law','NALSAR Hyderabad','nalsar-hyderabad','Government',1998,'Hyderabad','Telangana','500101',17.4428,78.3488,['Law'],200000,600000,'A',2,'Law',1600000,3500000,92,['AZB','Trilegal','Cyril Amarchand'],4.6,400,['NLU','Top 3 Law','CLAT'],'1580537659466-0a9bfa916a54','https://www.nalsar.ac.in','NALSAR Hyderabad is India\'s #2 law school with strong placements in top law firms.',false,true),
    makeCollege('NLU Delhi','NLU Delhi','nlu-delhi','Government',2008,'New Delhi','Delhi','110078',28.6141,77.3680,['Law'],250000,700000,'A',3,'Law',1700000,4000000,93,['AZB','Cyril Amarchand','SAM'],4.6,350,['NLU','Top Law','CLAT'],'1580537659466-0a9bfa916a54','https://www.nludelhi.ac.in','NLU Delhi is a top NLU in Delhi with strong constitutional law and corporate law programs.',false,true),
    makeCollege('NUJS Kolkata','NUJS Kolkata','nujs-kolkata','Government',1999,'Kolkata','West Bengal','700027',22.5353,88.3629,['Law'],200000,600000,'A',4,'Law',1500000,3500000,90,['Trilegal','AZB','Khaitan'],4.5,320,['NLU','Top Law','CLAT'],'1580537659466-0a9bfa916a54','https://www.nujs.edu','NUJS Kolkata is the top NLU in eastern India with strong legal academia.',false,true),
    makeCollege('NLU Jodhpur','NLU Jodhpur','nlu-jodhpur','Government',1999,'Jodhpur','Rajasthan','342304',26.3186,73.0543,['Law'],200000,600000,'A',5,'Law',1400000,3000000,88,['Trilegal','AZB','L&L Partners'],4.4,280,['NLU','CLAT'],'1580537659466-0a9bfa916a54','https://www.nlujodhpur.ac.in','NLU Jodhpur is a well-established national law university in Rajasthan.',false,true),
    makeCollege('GNLU Gandhinagar','GNLU','gnlu-gandhinagar','Government',2003,'Gandhinagar','Gujarat','382007',23.2157,72.6369,['Law'],200000,600000,'A',6,'Law',1300000,2800000,86,['AZB','Trilegal','Cyril Amarchand'],4.4,250,['NLU','Gujarat','CLAT'],'1580537659466-0a9bfa916a54','https://www.gnlu.ac.in','GNLU Gandhinagar is a leading NLU in Gujarat with strong placement record.',false,true),
  );

  // ── Private Engineering ──────────────────────────────────────────────────
  colleges.push(
    makeCollege('BITS Pilani','BITS Pilani','bits-pilani','Private',1964,'Pilani','Rajasthan','333031',28.3625,75.5870,['Engineering','Science','Pharmacy','Management'],500000,2200000,'A',26,'Engineering',1800000,18000000,92,['Google','Microsoft','Goldman Sachs','Samsung'],4.6,870,['BITS','BITSAT','Private Elite'],'1541339907198-e08756dedf3f','https://www.bits-pilani.ac.in','BITS Pilani is the leading private engineering institution known for its flexible academic system and Practice School.',true,true),
    makeCollege('Vellore Institute of Technology','VIT Vellore','vit-vellore','Private',1984,'Vellore','Tamil Nadu','632014',12.9692,79.1559,['Engineering','Science','Management','Law'],200000,700000,'A++',11,'Engineering',800000,12000000,85,['Microsoft','Amazon','TCS','Infosys'],4.3,2200,['VIT','VITEEE','NAAC A++'],'1562774053-701939374585','https://www.vit.ac.in','VIT Vellore is India\'s top-ranked private engineering university with NAAC A++ and strong placements.',true,true),
    makeCollege('SRM Institute of Science and Technology','SRM University','srm-university','Private',1985,'Chennai','Tamil Nadu','603203',12.8231,80.0444,['Engineering','Science','Management','Medical'],250000,800000,'A++',19,'Engineering',700000,10000000,82,['TCS','Infosys','Cognizant','Amazon'],4.2,1800,['SRM','SRMJEEE'],'1523050854058-8df90110c476','https://www.srmist.edu.in','SRM IST is a top private multi-disciplinary university in Chennai with excellent infrastructure.',true,true),
    makeCollege('Manipal Institute of Technology','MIT Manipal','mit-manipal','Private',1957,'Manipal','Karnataka','576104',13.3525,74.7928,['Engineering','Science','Management'],400000,1200000,'A++',28,'Engineering',900000,15000000,88,['Google','Amazon','Samsung','Microsoft'],4.4,1100,['Manipal','MET','Private Elite'],'1517245386807-bb43f82c33c4','https://www.manipal.edu','MIT Manipal is a premier private engineering college in the unique university town of Manipal.',true,true),
    makeCollege('Thapar Institute of Engineering','Thapar University','thapar-university','Private',1956,'Patiala','Punjab','147004',30.3566,76.3644,['Engineering','Science','Management'],300000,900000,'A',32,'Engineering',800000,10000000,84,['TCS','Infosys','Microsoft','Wipro'],4.3,600,['Thapar','Private'],'1541339907198-e08756dedf3f','https://www.thapar.edu','Thapar Institute in Patiala is a leading private engineering university in Punjab.',true,true),
    makeCollege('PES University','PES University','pes-university','Private',1972,'Bangalore','Karnataka','560085',12.9352,77.5360,['Engineering','Science','Management'],300000,800000,'A+',48,'Engineering',900000,12000000,82,['Google','Amazon','Microsoft','Flipkart'],4.3,500,['PES','PESSAT','Bangalore'],'1562774053-701939374585','https://www.pes.edu','PES University is a top private engineering university in Bangalore with strong industry connections.',true,true),
    makeCollege('Amity University','Amity University Noida','amity-university','Private',2005,'Noida','Uttar Pradesh','201313',28.5447,77.3323,['Engineering','Management','Law','Design','Medical'],200000,600000,'A+',0,'Engineering',500000,5000000,72,['TCS','Infosys','Wipro','Cognizant'],3.8,1500,['Amity','Private','Multi-Campus'],'1523050854058-8df90110c476','https://www.amity.edu','Amity University has multiple campuses across India offering diverse programs.',true,true),
    makeCollege('Lovely Professional University','LPU','lpu-phagwara','Private',2005,'Phagwara','Punjab','144411',31.2547,75.7052,['Engineering','Management','Law','Design','Agriculture'],150000,500000,'A+',0,'Engineering',400000,4000000,70,['TCS','Infosys','Wipro','Amazon'],3.7,2000,['LPU','Large Private'],'1607237138185-eedd9c632b0b','https://www.lpu.in','LPU is one of India\'s largest private universities with diverse programs across all fields.',true,true),
    makeCollege('Ashoka University','Ashoka University','ashoka-university','Private',2014,'Sonepat','Haryana','131029',28.9465,77.1142,['Arts','Science','Social Sciences','Economics'],500000,1200000,'A',0,'University',900000,5000000,85,['McKinsey','BCG','Goldman Sachs','JP Morgan'],4.4,350,['Liberal Arts','Private Elite'],'1541339907198-e08756dedf3f','https://www.ashoka.edu.in','Ashoka University is India\'s leading liberal arts university modeled on Ivy League education.',false,true),
    makeCollege('Universal AI University','Universal AI University','universal-ai-university','Private',2023,'Karjat','Maharashtra','410201',18.9175,73.3247,['Engineering','Science','Design'],500000,1500000,'',0,'Engineering',800000,8000000,80,['Tech Startups','AI Companies'],4.0,100,['AI University','New Age','Emerging'],'1517245386807-bb43f82c33c4','https://www.uaiu.ac.in','Universal AI University is India\'s first dedicated AI-focused university offering future-ready programs.',true,false),
  );

  // ── Design & Arts ────────────────────────────────────────────────────────
  colleges.push(
    makeCollege('National Institute of Design Ahmedabad','NID Ahmedabad','nid-ahmedabad','Government',1961,'Ahmedabad','Gujarat','380007',23.0366,72.5621,['Design'],300000,900000,'A',1,'Design',1400000,3500000,88,['Samsung','Google','Apple','Titan','IDEO'],4.5,420,['NID','#1 Design','NID DAT'],'1517245386807-bb43f82c33c4','https://www.nid.edu','NID Ahmedabad is India\'s #1 design institute (est. 1961). It fosters innovation across all design disciplines.',false,true),
    makeCollege('NIFT Delhi','NIFT Delhi','nift-delhi','Government',1986,'New Delhi','Delhi','110016',28.5494,77.1998,['Design'],200000,700000,'A',3,'Design',800000,3000000,80,['Fashion Brands','Design Studios'],4.3,350,['NIFT','Fashion Design'],'1523050854058-8df90110c476','https://www.nift.ac.in','NIFT Delhi is India\'s premier fashion design institute offering programs in fashion and textile design.',false,true),
  );

  // ── Top Universities ─────────────────────────────────────────────────────
  colleges.push(
    makeCollege('Indian Institute of Science','IISc Bangalore','iisc-bangalore','Government',1909,'Bangalore','Karnataka','560012',13.0218,77.5671,['Engineering','Science','Research'],30000,200000,'A++',1,'University',1500000,10000000,90,['Google','Microsoft','ISRO','DRDO'],4.9,650,['IISc','#1 University','Research'],'1541339907198-e08756dedf3f','https://www.iisc.ac.in','IISc Bangalore is India\'s #1 university in NIRF. Established in 1909, it is Asia\'s top research institute.',false,true),
    makeCollege('University of Delhi','Delhi University','delhi-university','Government',1922,'New Delhi','Delhi','110007',28.6889,77.2099,['Arts','Science','Commerce','Law','Education'],20000,200000,'A+',12,'University',800000,2500000,75,['Deloitte','EY','KPMG','TCS','Infosys'],4.4,2100,['DU','Central University','CUET'],'1607237138185-eedd9c632b0b','https://www.du.ac.in','Delhi University (est. 1922) is India\'s most prestigious central university with 90+ colleges.',false,true),
    makeCollege('Jawaharlal Nehru University','JNU Delhi','jnu-delhi','Government',1969,'New Delhi','Delhi','110067',28.5400,77.1673,['Arts','Science','Social Sciences','Languages'],10000,100000,'A++',2,'University',600000,2000000,65,['UPSC','Research Institutes','UN','World Bank'],4.5,900,['JNU','Research','Central University'],'1562774053-701939374585','https://www.jnu.ac.in','JNU is India\'s premier research university known for social sciences, international relations and politics.',false,true),
    makeCollege('Banaras Hindu University','BHU Varanasi','bhu-varanasi','Government',1916,'Varanasi','Uttar Pradesh','221005',25.2677,83.0055,['Engineering','Medical','Arts','Science','Commerce','Law','Agriculture'],10000,300000,'A',6,'University',700000,5000000,75,['TCS','Infosys','L&T','ONGC','DRDO'],4.3,1500,['BHU','Heritage University','Central'],'1607237138185-eedd9c632b0b','https://www.bhu.ac.in','BHU (est. 1916) is Asia\'s largest residential university offering 340+ courses across 140 departments.',true,true),
    makeCollege('Anna University','Anna University','anna-university','Government',1978,'Chennai','Tamil Nadu','600025',13.0095,80.2341,['Engineering','Architecture','Science'],50000,200000,'A+',14,'University',600000,5000000,78,['TCS','Infosys','Wipro','Cognizant','HCL'],4.3,1200,['Anna University','TNEA'],'1498243691581-b145c3f54a5a','https://www.annauniv.edu','Anna University is Tamil Nadu\'s top state university affiliating 500+ engineering colleges.',true,true),
    makeCollege('Jadavpur University','JU Kolkata','jadavpur-university','Government',1955,'Kolkata','West Bengal','700032',22.4973,88.3726,['Engineering','Arts','Science'],20000,100000,'A',17,'University',800000,8000000,85,['Google','Amazon','TCS','Infosys','Wipro'],4.5,700,['JU','WBJEE','Affordable Engineering'],'1607237138185-eedd9c632b0b','https://www.jaduniv.edu.in','Jadavpur University is Kolkata\'s top public university known for affordable quality engineering.',true,true),
    makeCollege('Delhi Technological University','DTU Delhi','dtu-delhi','Government',1941,'New Delhi','Delhi','110042',28.7499,77.1183,['Engineering','Management'],150000,500000,'A+',36,'Engineering',1300000,15000000,88,['Google','Microsoft','Samsung','Adobe'],4.4,900,['DTU','JAC Delhi','Engineering'],'1562774053-701939374585','https://www.dtu.ac.in','DTU (formerly DCE, est. 1941) is Delhi\'s top engineering college. Strong placements in tech sector.',true,true),
    makeCollege('Netaji Subhas University of Technology','NSUT Delhi','nsut-delhi','Government',1983,'New Delhi','Delhi','110078',28.6045,77.0586,['Engineering','Management'],150000,500000,'A+',42,'Engineering',1200000,12000000,85,['Amazon','Microsoft','Samsung','Paytm'],4.3,600,['NSUT','JAC Delhi'],'1523050854058-8df90110c476','https://www.nsut.ac.in','NSUT (formerly NSIT) is one of Delhi\'s top engineering colleges with strong industry placements.',true,true),
    makeCollege('Symbiosis International University','SIU Pune','siu-pune','Private',1971,'Pune','Maharashtra','411014',18.5628,73.9168,['Management','Law','Engineering','Design','Media'],200000,1500000,'A',20,'University',900000,5000000,88,['Deloitte','EY','Amazon','TCS'],4.3,750,['Symbiosis','SNAP','SET'],'1562774053-701939374585','https://www.siu.edu.in','Symbiosis International University offers diverse programs in management, law, engineering and design.',true,true),
    makeCollege('Savitribai Phule Pune University','SPPU Pune','sppu-pune','Government',1949,'Pune','Maharashtra','411007',18.5204,73.8567,['Arts','Science','Commerce','Engineering','Law'],10000,100000,'A+',10,'University',500000,3000000,70,['TCS','Infosys','Wipro','Cognizant'],4.2,1000,['SPPU','Pune University','Affiliating'],'1607237138185-eedd9c632b0b','https://www.unipune.ac.in','SPPU (est. 1949) is a major state university in Maharashtra affiliating 800+ colleges in Pune region.',true,true),
  );

  // ── More IITs & State Colleges to reach 100+ ────────────────────────────
  colleges.push(
    makeCollege('Indian Institute of Technology Gandhinagar','IIT Gandhinagar','iit-gandhinagar','Government',2008,'Gandhinagar','Gujarat','382355',23.2156,72.6830,['Engineering','Science'],200000,1000000,'A',17,'Engineering',1300000,10000000,86,['Google','Amazon','Microsoft','Samsung'],4.4,350,['IIT','Gujarat'],'1517245386807-bb43f82c33c4','https://www.iitgn.ac.in','IIT Gandhinagar is known for its focus on interdisciplinary research and liberal arts approach.',true,true),
    makeCollege('Indian Institute of Technology Jodhpur','IIT Jodhpur','iit-jodhpur','Government',2008,'Jodhpur','Rajasthan','342037',26.4747,73.1125,['Engineering','Science'],200000,1000000,'A',28,'Engineering',1200000,9000000,83,['TCS','Infosys','Samsung','L&T'],4.3,280,['IIT','Rajasthan'],'1523050854058-8df90110c476','https://www.iitj.ac.in','IIT Jodhpur in Rajasthan with a focus on sustainable engineering and research.',true,true),
    makeCollege('Indian Institute of Technology Tirupati','IIT Tirupati','iit-tirupati','Government',2015,'Tirupati','Andhra Pradesh','517619',13.6288,79.4192,['Engineering','Science'],200000,1000000,'A',31,'Engineering',1100000,8000000,81,['TCS','Infosys','Amazon','Wipro'],4.2,200,['IIT','Andhra Pradesh'],'1541339907198-e08756dedf3f','https://www.iittp.ac.in','IIT Tirupati is a growing IIT in Andhra Pradesh with focus on emerging technologies.',true,true),
    makeCollege('Indian Institute of Technology Palakkad','IIT Palakkad','iit-palakkad','Government',2015,'Palakkad','Kerala','678557',10.7867,76.6548,['Engineering','Science'],200000,1000000,'A',29,'Engineering',1100000,8500000,82,['TCS','Samsung','Infosys','Oracle'],4.3,180,['IIT','Kerala'],'1562774053-701939374585','https://www.iitpkd.ac.in','IIT Palakkad is a new IIT in Kerala focused on research-driven engineering education.',true,true),
    makeCollege('National Institute of Technology Silchar','NIT Silchar','nit-silchar','Government',1967,'Silchar','Assam','788010',24.8333,92.7789,['Engineering','Science'],150000,600000,'A',31,'Engineering',700000,6000000,80,['TCS','Infosys','Wipro','HCL'],4.1,350,['NIT','Northeast'],'1541339907198-e08756dedf3f','https://www.nits.ac.in','NIT Silchar is the leading engineering college in Assam and the Northeast region.',true,true),
    makeCollege('National Institute of Technology Kurukshetra','NIT Kurukshetra','nit-kurukshetra','Government',1963,'Kurukshetra','Haryana','136119',29.9478,76.8264,['Engineering','Science','Management'],150000,600000,'A',32,'Engineering',750000,6500000,81,['TCS','Infosys','Cognizant','Wipro'],4.1,380,['NIT','Haryana'],'1562774053-701939374585','https://www.nitkkr.ac.in','NIT Kurukshetra is a well-established NIT in Haryana with strong engineering programs.',true,true),
    makeCollege('Vellore Institute of Technology Chennai','VIT Chennai','vit-chennai','Private',2000,'Chennai','Tamil Nadu','600127',12.8406,80.1534,['Engineering','Science','Management'],200000,700000,'A+',0,'Engineering',750000,10000000,83,['TCS','Infosys','Wipro','Cognizant'],4.2,800,['VIT','VITEEE'],'1498243691581-b145c3f54a5a','https://chennai.vit.ac.in','VIT Chennai campus offers the same quality education as the main Vellore campus.',true,true),
    makeCollege('Kalinga Institute of Industrial Technology','KIIT University','kiit-bhubaneswar','Private',1992,'Bhubaneswar','Odisha','751024',20.3553,85.8245,['Engineering','Management','Law','Medical'],200000,700000,'A++',0,'Engineering',700000,8000000,85,['TCS','Infosys','Wipro','Amazon'],4.2,950,['KIIT','Private Deemed','Odisha'],'1523050854058-8df90110c476','https://www.kiit.ac.in','KIIT University is a leading private deemed university in Odisha with NAAC A++ accreditation.',true,true),
    makeCollege('Institute of Chemical Technology Mumbai','ICT Mumbai','ict-mumbai','Autonomous',1933,'Mumbai','Maharashtra','400019',19.0196,72.8550,['Engineering','Science'],100000,400000,'A++',3,'Pharmacy',800000,6000000,88,['Reliance','BASF','Tata Chemicals','P&G'],4.4,300,['ICT','Chemical Engineering','Pharmacy'],'1498243691581-b145c3f54a5a','https://www.ictmumbai.edu.in','ICT Mumbai (est. 1933) is India\'s top institution for chemical engineering and pharmaceutical sciences.',true,true),
    makeCollege('Coimbatore Institute of Technology','CIT Coimbatore','cit-coimbatore','Government',1956,'Coimbatore','Tamil Nadu','641014',11.0268,76.9550,['Engineering','Science'],100000,400000,'A',0,'Engineering',600000,5000000,80,['TCS','Infosys','Wipro','Cognizant'],4.1,400,['CIT','State Engineering'],'1517245386807-bb43f82c33c4','https://www.cit.edu.in','CIT Coimbatore is a top government engineering college in Tamil Nadu with strong placements.',true,true),
    makeCollege('BMS College of Engineering','BMSCE Bangalore','bmsce-bangalore','Private',1946,'Bangalore','Karnataka','560019',12.9438,77.5621,['Engineering','Management'],200000,600000,'A',0,'Engineering',700000,7000000,82,['Google','Amazon','Infosys','Wipro'],4.2,500,['BMSCE','Bangalore Engineering'],'1541339907198-e08756dedf3f','https://www.bmsce.ac.in','BMS College of Engineering (est. 1946) is one of Bangalore\'s oldest and most respected engineering colleges.',true,true),
    makeCollege('PSG College of Technology','PSG Tech','psg-coimbatore','Private',1951,'Coimbatore','Tamil Nadu','641004',11.0233,77.0033,['Engineering','Science','Management'],150000,500000,'A++',0,'Engineering',650000,6000000,82,['TCS','Infosys','Wipro','L&T'],4.2,450,['PSG Tech','Tamil Nadu'],'1562774053-701939374585','https://www.psgtech.edu','PSG Tech is a top private engineering college in Coimbatore with NAAC A++ accreditation.',true,true),
    // Additional IITs
    makeCollege('Indian Institute of Technology Jammu','IIT Jammu','iit-jammu','Government',2016,'Jammu','Jammu and Kashmir','181221',32.8012,74.8901,['Engineering','Science'],200000,1000000,'A',62,'Engineering',1200000,8000000,83,['TCS','Infosys','Amazon','L&T'],4.3,150,['IIT','Jammu'],'1541339907198-e08756dedf3f','https://www.iitjammu.ac.in','IIT Jammu is a premier public university established in the scenic union territory of Jammu and Kashmir.',true,true),
    makeCollege('Indian Institute of Technology Bhilai','IIT Bhilai','iit-bhilai','Government',2016,'Raipur','Chhattisgarh','492015',21.1244,81.7661,['Engineering','Science'],200000,1000000,'A',73,'Engineering',1100000,7500000,82,['Amazon','TCS','Wipro','L&T'],4.2,120,['IIT','Chhattisgarh'],'1517245386807-bb43f82c33c4','https://www.iitbhilai.ac.in','IIT Bhilai is an emerging IIT located in Chhattisgarh, focused on research and state-of-the-art tech.',true,true),
    makeCollege('Indian Institute of Technology Dharwad','IIT Dharwad','iit-dharwad','Government',2016,'Dharwad','Karnataka','580011',15.4889,74.9254,['Engineering','Science'],200000,1000000,'A',84,'Engineering',1150000,8000000,81,['Google','Microsoft','TCS','Wipro'],4.2,110,['IIT','Karnataka'],'1498243691581-b145c3f54a5a','https://www.iitdh.ac.in','IIT Dharwad is located in Karnataka, offering quality engineering education and research focus.',true,true),
    makeCollege('Indian Institute of Technology Goa','IIT Goa','iit-goa','Government',2016,'Farmagudi','Goa','403401',15.4214,73.9781,['Engineering','Science'],200000,1000000,'A',80,'Engineering',1200000,8500000,84,['Amazon','Microsoft','Samsung','TCS'],4.3,100,['IIT','Goa'],'1562774053-701939374585','https://www.iitgoa.ac.in','IIT Goa is a premier technological institute offering research-driven programs in a vibrant environment.',true,true),
    // Additional NITs
    makeCollege('Dr. B. R. Ambedkar National Institute of Technology Jalandhar','NIT Jalandhar','nit-jalandhar','Government',1987,'Jalandhar','Punjab','144011',31.3961,75.5352,['Engineering','Science'],150000,600000,'A',46,'Engineering',850000,7500000,85,['TCS','Infosys','Wipro','Microsoft'],4.2,400,['NIT','Punjab'],'1517245386807-bb43f82c33c4','https://www.nitj.ac.in','NIT Jalandhar offers exceptional engineering and science programs with modern lab infrastructure.',true,true),
    makeCollege('National Institute of Technology Patna','NIT Patna','nit-patna','Government',1886,'Patna','Bihar','800005',25.6208,85.1724,['Engineering','Science','Architecture'],150000,600000,'A',56,'Engineering',800000,7000000,82,['TCS','Infosys','Cognizant','L&T'],4.1,380,['NIT','Bihar'],'1541339907198-e08756dedf3f','https://www.nitp.ac.in','NIT Patna is one of the oldest engineering institutions in India, upgraded to an NIT in 2004.',true,true),
    makeCollege('National Institute of Technology Raipur','NIT Raipur','nit-raipur','Government',1956,'Raipur','Chhattisgarh','492010',21.2497,81.6050,['Engineering','Science','Architecture'],150000,600000,'A',70,'Engineering',750000,6000000,80,['TCS','Wipro','Infosys','Capgemini'],4.1,420,['NIT','Chhattisgarh'],'1562774053-701939374585','https://www.nitrr.ac.in','NIT Raipur is a prestigious technological institute offering high-quality engineering programs.',true,true),
    makeCollege('National Institute of Technology Hamirpur','NIT Hamirpur','nit-hamirpur','Government',1986,'Hamirpur','Himachal Pradesh','177005',31.7081,76.5274,['Engineering','Science','Architecture'],150000,600000,'A',60,'Engineering',780000,6500000,82,['TCS','Infosys','Wipro','L&T'],4.2,320,['NIT','Himachal'],'1607237138185-eedd9c632b0b','https://www.nith.ac.in','NIT Hamirpur features a scenic campus in Himachal Pradesh, providing stellar engineering courses.',true,true),
    // Additional IIITs
    makeCollege('Indian Institute of Information Technology Sri City','IIIT Sri City','iiit-sricity','Government',2013,'Sri City','Andhra Pradesh','517646',13.5559,80.0248,['Engineering'],250000,600000,'A',76,'Engineering',1200000,10000000,88,['Amazon','Microsoft','L&T','TCS'],4.3,250,['IIIT','Andhra Pradesh'],'1517245386807-bb43f82c33c4','https://www.iiits.ac.in','IIIT Sri City focuses on research and industrial training in the industrial hub of Sri City.',true,true),
    makeCollege('Indian Institute of Information Technology Pune','IIIT Pune','iiit-pune','Government',2016,'Pune','Maharashtra','411041',18.4575,73.8508,['Engineering'],250000,600000,'A',85,'Engineering',1100000,9000000,85,['Amazon','TCS','Wipro','Infosys'],4.2,200,['IIIT','Pune'],'1541339907198-e08756dedf3f','https://www.iiitp.ac.in','IIIT Pune is an emerging technological institute with strong computer science focus in Pune.',true,true),
    makeCollege('Indian Institute of Information Technology Kota','IIIT Kota','iiit-kota','Government',2013,'Kota','Rajasthan','325003',25.1386,75.8052,['Engineering'],220000,500000,'A',95,'Engineering',950000,8000000,83,['TCS','Infosys','Capgemini','Wipro'],4.1,180,['IIIT','Kota'],'1562774053-701939374585','https://www.iiitkota.ac.in','IIIT Kota runs temporarily from MNIT Jaipur campus, offering strong IT education.',true,true),
    makeCollege('Indian Institute of Information Technology Vadodara','IIIT Vadodara','iiit-vadodara','Government',2013,'Vadodara','Gujarat','382007',23.2157,72.6369,['Engineering'],220000,500000,'A',90,'Engineering',1000000,9500000,84,['TCS','Infosys','Amazon','L&T'],4.2,190,['IIIT','Gujarat'],'1607237138185-eedd9c632b0b','https://www.iiitvadodara.ac.in','IIIT Vadodara is an institute of national importance established under a PPP model in Gujarat.',true,true),
    // Additional IIMs
    makeCollege('Indian Institute of Management Ranchi','IIM Ranchi','iim-ranchi','Government',2010,'Ranchi','Jharkhand','834008',23.3441,85.3090,['Business','Management'],1800000,2200000,'A++',24,'Management',1700000,6700000,100,['Deloitte','EY','KPMG','TCS','Infosys'],4.5,400,['IIM','Ranchi','CAT'],'1523050854058-8df90110c476','https://www.iimranchi.ac.in','IIM Ranchi offers flagship management programs with top-tier corporate integration.',true,true),
    makeCollege('Indian Institute of Management Kashipur','IIM Kashipur','iim-kashipur','Government',2011,'Kashipur','Uttarakhand','263139',29.2104,78.9626,['Business','Management'],1700000,2100000,'A++',28,'Management',1650000,6000000,98,['Deloitte','EY','KPMG','Amazon'],4.4,320,['IIM','Kashipur','CAT'],'1580537659466-0a9bfa916a54','https://www.iimkashipur.ac.in','IIM Kashipur offers cutting-edge PGDM programs in the beautiful region of Uttarakhand.',true,true),
    makeCollege('Indian Institute of Management Rohtak','IIM Rohtak','iim-rohtak','Government',2010,'Rohtak','Haryana','124010',28.8955,76.6066,['Business','Management'],1790000,2200000,'A++',12,'Management',1800000,7000000,99,['KPMG','Deloitte','EY','PwC'],4.5,380,['IIM','Rohtak','CAT'],'1551076805-e1869033e561','https://www.iimrohtak.ac.in','IIM Rohtak is situated near the national capital region, known for executive management research.',true,true),
    makeCollege('Indian Institute of Management Raipur','IIM Raipur','iim-raipur','Government',2010,'Raipur','Chhattisgarh','492015',21.1544,81.7661,['Business','Management'],1600000,2000000,'A++',11,'Management',1750000,6500000,99,['Deloitte','EY','KPMG','TCS'],4.5,360,['IIM','Raipur','CAT'],'1517245386807-bb43f82c33c4','https://www.iimraipur.ac.in','IIM Raipur is committed to promoting value-based management education and research.',true,true),
    // Additional Medical
    makeCollege('All India Institute of Medical Sciences Bhubaneswar','AIIMS Bhubaneswar','aiims-bhubaneswar','Government',2012,'Bhubaneswar','Odisha','751019',20.2547,85.7725,['Medical','Nursing'],10000,60000,'A++',17,'Medical',1000000,3000000,98,['AIIMS Network','Govt Hospitals'],4.6,350,['AIIMS','NEET','Odisha'],'1551076805-e1869033e561','https://www.aiimsbhubaneswar.edu.in','AIIMS Bhubaneswar is a premier clinical and research hospital under the PMSSY scheme.',false,true),
    makeCollege('All India Institute of Medical Sciences Patna','AIIMS Patna','aiims-patna','Government',2012,'Patna','Bihar','801507',25.5672,85.0747,['Medical','Nursing'],10000,60000,'A+',26,'Medical',950000,2800000,96,['AIIMS Network','Govt Hospitals'],4.4,280,['AIIMS','NEET','Bihar'],'1551076805-e1869033e561','https://www.aiimspatna.edu.in','AIIMS Patna is a top government medical college and hospital in Bihar.',false,true),
    makeCollege('All India Institute of Medical Sciences Rishikesh','AIIMS Rishikesh','aiims-rishikesh','Government',2012,'Rishikesh','Uttarakhand','249203',30.1031,78.2932,['Medical','Nursing'],10000,60000,'A+',22,'Medical',1000000,3000000,97,['AIIMS Network','Govt Hospitals'],4.5,290,['AIIMS','NEET','Uttarakhand'],'1551076805-e1869033e561','https://www.aiimsrishikesh.edu.in','AIIMS Rishikesh is a premier medical university and hospital located in Uttarakhand.',false,true),
    // Additional Law
    makeCollege('National Law University Odisha','NLU Odisha','nlu-odisha','Government',2009,'Cuttack','Odisha','753008',20.4625,85.8828,['Law'],200000,600000,'A',9,'Law',1200000,2500000,85,['Khaitan','AZB','Trilegal','SAM'],4.4,210,['NLU','CLAT','Odisha'],'1580537659466-0a9bfa916a54','https://www.nluo.ac.in','NLU Odisha is a highly reputed national law university with active legal aid clinics.',false,true),
    makeCollege('National Law Institute University Bhopal','NLIU Bhopal','nliu-bhopal','Government',1997,'Bhopal','Madhya Pradesh','462044',23.2133,77.3893,['Law'],200000,600000,'A',5,'Law',1300000,2800000,87,['Khaitan','AZB','Trilegal'],4.5,230,['NLU','CLAT','Bhopal'],'1580537659466-0a9bfa916a54','https://www.nliu.ac.in','NLIU Bhopal is one of the earliest NLUs established under the CLAT consortium.',false,true),
    // Additional Private/Deemed
    makeCollege('Manipal University Jaipur','MUJ Jaipur','muj-jaipur','Private',2011,'Jaipur','Rajasthan','303007',26.8438,75.5621,['Engineering','Science','Management','Law','Design'],250000,800000,'A+',0,'Engineering',700000,8500000,80,['TCS','Infosys','Wipro','Amazon'],4.2,850,['Manipal','Jaipur','MUJ'],'1523050854058-8df90110c476','https://www.jaipur.manipal.edu','Manipal University Jaipur provides top-tier education with standard infrastructure in Rajasthan.',true,true),
    makeCollege('Christ University Bangalore','Christ University','christ-university','Deemed',1969,'Bangalore','Karnataka','560029',12.9352,77.6060,['Arts','Science','Commerce','Management','Law'],100000,500000,'A+',60,'University',800000,2000000,85,['Deloitte','EY','KPMG','PwC','TCS'],4.4,1800,['Christ','Bangalore','CUET'],'1607237138185-eedd9c632b0b','https://www.christuniversity.in','Christ University is a highly popular deemed university known for its strict discipline and quality business programs.',false,true),
    makeCollege('SVKM\'s NMIMS Deemed to be University','NMIMS Mumbai','nmims-mumbai','Deemed',1981,'Mumbai','Maharashtra','400056',19.1105,72.8438,['Business','Management','Engineering','Law','Pharmacy'],300000,1200000,'A+',21,'Management',2000000,6000000,95,['Deloitte','EY','Goldman Sachs','PwC'],4.5,1200,['NMIMS','NMAT','Mumbai'],'1562774053-701939374585','https://www.nmims.edu','NMIMS Mumbai is a premier private university famous for its business school and engineering campuses.',true,true),
    makeCollege('Chandigarh University','Chandigarh University','chandigarh-university','Private',2012,'Mohali','Punjab','140413',30.7716,76.5724,['Engineering','Management','Law','Design','Medical'],180000,500000,'A+',27,'University',650000,4500000,83,['TCS','Infosys','Wipro','Cognizant'],4.1,1900,['CU','Chandigarh','Private'],'1523050854058-8df90110c476','https://www.cuchd.in','Chandigarh University is a rapidly growing private university with NAAC A+ accreditation in Punjab.',true,true),
    // Additional Core Engineering
    makeCollege('College of Engineering Guindy','CEG Chennai','ceg-chennai','Government',1794,'Chennai','Tamil Nadu','600025',13.0116,80.2354,['Engineering','Science'],50000,150000,'A++',8,'Engineering',900000,7500000,86,['TCS','Infosys','Amazon','Qualcomm'],4.5,600,['CEG','Anna University','Chennai'],'1498243691581-b145c3f54a5a','https://www.ceg.annauniv.edu','College of Engineering Guindy (est. 1794) is the oldest engineering college in India.',true,true),
    makeCollege('RV College of Engineering','RVCE Bangalore','rvce-bangalore','Private',1963,'Bangalore','Karnataka','560059',12.9238,77.4988,['Engineering','Science'],250000,700000,'A',96,'Engineering',1100000,12000000,91,['Google','Microsoft','Cisco','TCS'],4.4,720,['RVCE','KCET','COMEDK'],'1541339907198-e08756dedf3f','https://www.rvce.edu.in','RVCE is a top-tier private engineering college affiliated to VTU, located in Bangalore.',true,true)
  );

  // ── Insert all colleges into MongoDB ────────────────────────────────────
  try {
    await College.insertMany(colleges, { ordered: false });
    logger.info(`✅ Inserted ${colleges.length} colleges successfully`);
  } catch (insertErr: any) {
    // Handle duplicate key errors gracefully — some may already exist
    if (insertErr.code === 11000 || insertErr.writeErrors) {
      const inserted = colleges.length - (insertErr.writeErrors?.length || 0);
      logger.info(`✅ Inserted ${inserted} colleges (some duplicates skipped)`);
    } else {
      throw insertErr;
    }
  }
}
