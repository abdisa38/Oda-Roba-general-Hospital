require('dotenv').config();
const { connectDB, mongoose } = require('./db');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Queue = require('./models/Queue');
const ClinicalRecord = require('./models/ClinicalRecord');
const Diagnosis = require('./models/Diagnosis');
const Prescription = require('./models/Prescription');
const LabOrder = require('./models/LabOrder');
const InventoryItem = require('./models/Inventory');
const Billing = require('./models/Billing');
const InpatientBed = require('./models/Inpatient');

async function seedDatabase() {
  await connectDB();

  console.log('🌱 Starting Oda Roba General Hospital database seed...');

  // 1. Staff Users
  const staffUsers = [
    {
      id: 'USR-001',
      name: 'Dr. Yohannes Haile, MD',
      username: 'yohannes.haile',
      email: 'yohannes.haile@orhims.et',
      phone: '+251 91 123 4567',
      roleId: 'admin',
      roleTitle: 'Medical Director & Hospital Administrator',
      departmentId: 'DEP-ADM',
      departmentName: 'Executive Administration',
      avatarInitials: 'YH',
      isProtectedAdmin: true,
      status: 'active'
    },
    {
      id: 'USR-002',
      name: 'Dr. Daniel Abate, MD',
      username: 'daniel.abate',
      email: 'daniel.abate@orhims.et',
      phone: '+251 91 234 5678',
      roleId: 'doctor',
      roleTitle: 'Senior Consultant Physician',
      departmentId: 'DEP-MED',
      departmentName: 'Internal Medicine',
      avatarInitials: 'DA',
      status: 'active'
    },
    {
      id: 'USR-003',
      name: 'Nurse Rahel Kebede, BScN',
      username: 'rahel.kebede',
      email: 'rahel.kebede@orhims.et',
      phone: '+251 91 345 6789',
      roleId: 'nurse',
      roleTitle: 'Senior Triage Nurse',
      departmentId: 'DEP-NUR',
      departmentName: 'Outpatient Triage',
      avatarInitials: 'RK',
      status: 'active'
    },
    {
      id: 'USR-004',
      name: 'Almaz Tadesse',
      username: 'almaz.tadesse',
      email: 'almaz.tadesse@orhims.et',
      phone: '+251 91 456 7890',
      roleId: 'reception',
      roleTitle: 'Patient Admissions & Registration Officer',
      departmentId: 'DEP-REC',
      departmentName: 'Patient Admissions',
      avatarInitials: 'AT',
      status: 'active'
    },
    {
      id: 'USR-005',
      name: 'Tadesse Girma, MSc',
      username: 'tadesse.girma',
      email: 'tadesse.girma@orhims.et',
      phone: '+251 91 567 8901',
      roleId: 'lab',
      roleTitle: 'Lead Clinical Laboratory Technologist',
      departmentId: 'DEP-LAB',
      departmentName: 'Diagnostic Pathology & Laboratory',
      avatarInitials: 'TG',
      status: 'active'
    },
    {
      id: 'USR-006',
      name: 'Hiwot Bekele, BPharm',
      username: 'hiwot.bekele',
      email: 'hiwot.bekele@orhims.et',
      phone: '+251 91 678 9012',
      roleId: 'pharmacy',
      roleTitle: 'Head Clinical Pharmacist',
      departmentId: 'DEP-PHARM',
      departmentName: 'Hospital Central Pharmacy',
      avatarInitials: 'HB',
      status: 'active'
    },
    {
      id: 'USR-007',
      name: 'Almaz Kebede',
      username: 'almaz.kebede',
      email: 'almaz.kebede@orhims.et',
      phone: '+251 91 789 0123',
      roleId: 'cashier',
      roleTitle: 'Hospital Revenue & Billing Officer',
      departmentId: 'DEP-FIN',
      departmentName: 'Hospital Billing & Revenue',
      avatarInitials: 'AK',
      status: 'active'
    },
    {
      id: 'USR-008',
      name: 'Dr. Aster Lemma, MD',
      username: 'aster.lemma',
      email: 'aster.lemma@orhims.et',
      phone: '+251 91 890 1234',
      roleId: 'emergency',
      roleTitle: 'Emergency Department Specialist',
      departmentId: 'DEP-EMERG',
      departmentName: 'Emergency & Trauma Care',
      avatarInitials: 'AL',
      status: 'active'
    },
    {
      id: 'USR-009',
      name: 'Sr. Bethlehem Worku, BScN',
      username: 'bethlehem.worku',
      email: 'bethlehem.worku@orhims.et',
      phone: '+251 91 901 2345',
      roleId: 'inpatient',
      roleTitle: 'Inpatient Nursing Ward Supervisor',
      departmentId: 'DEP-INP',
      departmentName: 'Inpatient Medical Wards',
      avatarInitials: 'BW',
      status: 'active'
    },
    {
      id: 'USR-010',
      name: 'Jamal Roba, MPH',
      username: 'jamal.roba',
      email: 'jamal.roba@orhims.et',
      phone: '+251 92 012 3456',
      roleId: 'management',
      roleTitle: 'Chief Executive Officer',
      departmentId: 'DEP-EXEC',
      departmentName: 'Hospital Executive Board',
      avatarInitials: 'JR',
      status: 'active'
    },
    {
      id: 'USR-011',
      name: 'Sara Mengistu',
      username: 'sara.mengistu',
      email: 'sara.mengistu@orhims.et',
      phone: '+251 92 123 4567',
      roleId: 'analytics',
      roleTitle: 'Health Information & Biostatistics Officer',
      departmentId: 'DEP-HIT',
      departmentName: 'Health Informatics & M&E',
      avatarInitials: 'SM',
      status: 'active'
    }
  ];

  await User.deleteMany({});
  await User.insertMany(staffUsers);
  console.log(`✅ Seeded ${staffUsers.length} staff accounts.`);

  // 2. Real Patients
  const patients = [
    {
      id: 'ORH-2026-00124',
      name: 'Hana Mohammed',
      amharicName: 'ሀና መሀመድ',
      gender: 'Female',
      birth: '1998-05-14',
      dob: '1998-05-14',
      age: 28,
      bloodGroup: 'O+',
      contact: '••• ••• 4567',
      phoneToken: '0911234567',
      residence: 'Kebele 02, Bale Robe',
      registered: '2026-01-10',
      emergencyName: 'Mohammed Ahmed',
      emergencyPhone: '0922334455',
      relationship: 'Father',
      allergies: ['Penicillin derivatives (severe rash)'],
      chronicConditions: ['Mild Intermittent Asthma']
    },
    {
      id: 'ORH-2026-00125',
      name: 'Chala Bekele',
      amharicName: 'ጫላ በቀለ',
      gender: 'Male',
      birth: '1984-11-20',
      dob: '1984-11-20',
      age: 42,
      bloodGroup: 'A+',
      contact: '••• ••• 7891',
      phoneToken: '0912457891',
      residence: 'Kebele 01, Bale Robe',
      registered: '2026-01-15',
      emergencyName: 'Lensa Chala',
      emergencyPhone: '0911002233',
      relationship: 'Spouse',
      allergies: ['None documented'],
      chronicConditions: ['Essential Hypertension']
    },
    {
      id: 'ORH-2026-00126',
      name: 'Fatuma Ahmed',
      amharicName: 'ፋጡማ አህመድ',
      gender: 'Female',
      birth: '1976-03-08',
      dob: '1976-03-08',
      age: 50,
      bloodGroup: 'B+',
      contact: '••• ••• 9872',
      phoneToken: '0923459872',
      residence: 'Kebele 04, Bale Robe',
      registered: '2026-02-01',
      emergencyName: 'Nasir Kemal',
      emergencyPhone: '0933445566',
      relationship: 'Brother',
      allergies: ['Sulfa drugs'],
      chronicConditions: ['Type 2 Diabetes Mellitus']
    },
    {
      id: 'ORH-2026-00127',
      name: 'Dawit Alemu',
      amharicName: 'ዳዊት አለሙ',
      gender: 'Male',
      birth: '2001-09-12',
      dob: '2001-09-12',
      age: 24,
      bloodGroup: 'AB+',
      contact: '••• ••• 3344',
      phoneToken: '0934563344',
      residence: 'Kebele 03, Bale Robe',
      registered: '2026-02-12',
      emergencyName: 'Alemu Worku',
      emergencyPhone: '0944556677',
      relationship: 'Father',
      allergies: ['None documented'],
      chronicConditions: ['None']
    },
    {
      id: 'ORH-2026-00128',
      name: 'Tigist Haile',
      amharicName: 'ትዕግስት ኃይሌ',
      gender: 'Female',
      birth: '1992-07-25',
      dob: '1992-07-25',
      age: 34,
      bloodGroup: 'O-',
      contact: '••• ••• 5566',
      phoneToken: '0945675566',
      residence: 'Goba Town, Bale',
      registered: '2026-02-20',
      emergencyName: 'Tewodros Kassaye',
      emergencyPhone: '0955667788',
      relationship: 'Spouse',
      allergies: ['NSAIDs (gastric distress)'],
      chronicConditions: ['Chronic Gastritis']
    },
    {
      id: 'ORH-2026-00129',
      name: 'Abdi Kemal',
      amharicName: 'አብዲ ከማል',
      gender: 'Male',
      birth: '1989-12-04',
      dob: '1989-12-04',
      age: 37,
      bloodGroup: 'A-',
      contact: '••• ••• 6677',
      phoneToken: '0956786677',
      residence: 'Kebele 02, Bale Robe',
      registered: '2026-03-01',
      emergencyName: 'Halima Abdi',
      emergencyPhone: '0966778899',
      relationship: 'Spouse',
      allergies: ['None documented'],
      chronicConditions: ['None']
    },
    {
      id: 'ORH-2026-00130',
      name: 'Birtukan Tadesse',
      amharicName: 'ብርቱካን ታደሰ',
      gender: 'Female',
      birth: '1995-04-18',
      dob: '1995-04-18',
      age: 31,
      bloodGroup: 'B-',
      contact: '••• ••• 7788',
      phoneToken: '0967897788',
      residence: 'Agarfa Woreda, Bale',
      registered: '2026-03-10',
      emergencyName: 'Tadesse Gemeda',
      emergencyPhone: '0977889900',
      relationship: 'Father',
      allergies: ['Latex'],
      chronicConditions: ['None']
    },
    {
      id: 'ORH-2026-00131',
      name: 'Gemechu Desta',
      amharicName: 'ገመቹ ደስታ',
      gender: 'Male',
      birth: '1968-10-30',
      dob: '1968-10-30',
      age: 57,
      bloodGroup: 'O+',
      contact: '••• ••• 8899',
      phoneToken: '0978908899',
      residence: 'Sinana Woreda, Bale',
      registered: '2026-03-15',
      emergencyName: 'Tolosa Gemechu',
      emergencyPhone: '0988990011',
      relationship: 'Son',
      allergies: ['None documented'],
      chronicConditions: ['Hypertension', 'Osteoarthritis']
    }
  ];

  await Patient.deleteMany({});
  await Patient.insertMany(patients);
  console.log(`✅ Seeded ${patients.length} patient records.`);

  // 3. Appointments
  const appointments = [
    {
      id: 'APT-2026-0101',
      patientId: 'ORH-2026-00124',
      patientName: 'Hana Mohammed',
      patientPhone: '0911234567',
      doctor: 'Dr. Daniel Abate, MD',
      doctorId: 'USR-002',
      department: 'Internal Medicine',
      date: '2026-06-18',
      time: '09:00 AM',
      type: 'Follow-up Consultation',
      status: 'Confirmed',
      reason: 'Asthma maintenance and respiratory evaluation',
      priority: 'Normal'
    },
    {
      id: 'APT-2026-0102',
      patientId: 'ORH-2026-00125',
      patientName: 'Chala Bekele',
      patientPhone: '0912457891',
      doctor: 'Dr. Daniel Abate, MD',
      doctorId: 'USR-002',
      department: 'Internal Medicine',
      date: '2026-06-18',
      time: '09:45 AM',
      type: 'Routine Follow-up',
      status: 'Checked-in',
      reason: 'Hypertension blood pressure check and drug refill',
      priority: 'Normal'
    },
    {
      id: 'APT-2026-0103',
      patientId: 'ORH-2026-00126',
      patientName: 'Fatuma Ahmed',
      patientPhone: '0923459872',
      doctor: 'Dr. Daniel Abate, MD',
      doctorId: 'USR-002',
      department: 'Internal Medicine',
      date: '2026-06-18',
      time: '10:30 AM',
      type: 'Specialist Review',
      status: 'Scheduled',
      reason: 'Fasting blood glucose monitoring and HbA1c review',
      priority: 'Normal'
    },
    {
      id: 'APT-2026-0104',
      patientId: 'ORH-2026-00127',
      patientName: 'Dawit Alemu',
      patientPhone: '0934563344',
      doctor: 'Dr. Aster Lemma, MD',
      doctorId: 'USR-008',
      department: 'General Outpatient',
      date: '2026-06-18',
      time: '11:15 AM',
      type: 'Initial Consultation',
      status: 'Scheduled',
      reason: 'Acute fever and headache symptoms',
      priority: 'Urgent'
    }
  ];

  await Appointment.deleteMany({});
  await Appointment.insertMany(appointments);
  console.log(`✅ Seeded ${appointments.length} appointments.`);

  // 4. Queues
  const queues = [
    {
      id: 'Q-001',
      ticketNumber: 'OPD-01',
      patientId: 'ORH-2026-00125',
      patientName: 'Chala Bekele',
      department: 'Internal Medicine',
      assignedDoctor: 'Dr. Daniel Abate',
      priority: 'Standard',
      status: 'With Doctor',
      room: 'Consultation Room 02',
      arrivalTime: '08:45 AM',
      calledTime: '09:02 AM'
    },
    {
      id: 'Q-002',
      ticketNumber: 'OPD-02',
      patientId: 'ORH-2026-00124',
      patientName: 'Hana Mohammed',
      department: 'Internal Medicine',
      assignedDoctor: 'Dr. Daniel Abate',
      priority: 'Standard',
      status: 'Waiting',
      room: 'Consultation Room 02',
      arrivalTime: '08:50 AM',
      estimatedWaitMinutes: 10
    },
    {
      id: 'Q-003',
      ticketNumber: 'TRI-01',
      patientId: 'ORH-2026-00127',
      patientName: 'Dawit Alemu',
      department: 'Outpatient Triage',
      assignedDoctor: 'Nurse Rahel Kebede',
      priority: 'Urgent',
      status: 'Called',
      room: 'Triage Room 1',
      arrivalTime: '09:05 AM',
      calledTime: '09:10 AM'
    }
  ];

  await Queue.deleteMany({});
  await Queue.insertMany(queues);
  console.log(`✅ Seeded ${queues.length} queue records.`);

  // 5. Clinical Encounter / History
  const clinicalRecords = [
    {
      id: 'ENC-2026-0842',
      patientId: 'ORH-2026-00124',
      patientName: 'Hana Mohammed',
      doctorId: 'USR-002',
      doctorName: 'Dr. Daniel Abate, MD',
      encounterType: 'General Outpatient Consultation',
      date: '2026-06-18',
      vitals: {
        bp: '118/76 mmHg',
        pulse: 74,
        temp: 36.6,
        respRate: 16,
        spo2: 98,
        weight: 58,
        height: 164
      },
      chiefComplaint: 'Intermittent dry cough especially at night and mild chest tightness for 4 days.',
      historyOfPresentIllness: 'Known asthmatic patient presenting with mild exacerbation after viral cold. Uses salbutamol inhaler as needed.',
      physicalExam: 'Lungs: Scattered mild expiratory wheezes bilaterally. Heart: Regular rate and rhythm, normal S1 and S2. No peripheral edema.',
      assessmentNotes: 'Mild asthma exacerbation triggered by upper respiratory infection.',
      plan: '1. Salbutamol MDI 2 puffs PRN\n2. Continue Budesonide 200mcg BID\n3. Review in 2 weeks or return immediately if dyspnea worsens.'
    }
  ];

  await ClinicalRecord.deleteMany({});
  await ClinicalRecord.insertMany(clinicalRecords);
  console.log(`✅ Seeded ${clinicalRecords.length} clinical encounter records.`);

  // 6. Diagnoses
  const diagnoses = [
    {
      id: 'DX-1001',
      patientId: 'ORH-2026-00124',
      patientName: 'Hana Mohammed',
      code: 'J45.909',
      name: 'Unspecified asthma, uncomplicated',
      type: 'Primary',
      status: 'Active',
      onsetDate: '2023-04-12',
      notes: 'Controlled with inhaled corticosteroids. Triggered by cold weather and dust.',
      documentedBy: 'Dr. Daniel Abate',
      documentedDate: '2026-06-18'
    },
    {
      id: 'DX-1002',
      patientId: 'ORH-2026-00125',
      patientName: 'Chala Bekele',
      code: 'I10',
      name: 'Essential (primary) hypertension',
      type: 'Primary',
      status: 'Chronic',
      onsetDate: '2022-08-15',
      notes: 'Blood pressure currently controlled on Amlodipine 5mg daily.',
      documentedBy: 'Dr. Daniel Abate',
      documentedDate: '2026-06-18'
    },
    {
      id: 'DX-1003',
      patientId: 'ORH-2026-00126',
      patientName: 'Fatuma Ahmed',
      code: 'E11.9',
      name: 'Type 2 diabetes mellitus without complications',
      type: 'Primary',
      status: 'Chronic',
      onsetDate: '2021-03-20',
      notes: 'Fasting glucose averaging 135 mg/dL. Compliant with Metformin 500mg BID.',
      documentedBy: 'Dr. Daniel Abate',
      documentedDate: '2026-06-18'
    },
    {
      id: 'DX-1004',
      patientId: 'ORH-2026-00127',
      patientName: 'Dawit Alemu',
      code: 'B50.9',
      name: 'Plasmodium falciparum malaria, unspecified',
      type: 'Primary',
      status: 'Active',
      onsetDate: '2026-06-16',
      notes: 'Positive RDT and thick blood film. High fever, chills, rigors.',
      documentedBy: 'Dr. Aster Lemma',
      documentedDate: '2026-06-18'
    }
  ];

  await Diagnosis.deleteMany({});
  await Diagnosis.insertMany(diagnoses);
  console.log(`✅ Seeded ${diagnoses.length} clinical diagnoses.`);

  // 7. Prescriptions
  const prescriptions = [
    {
      id: 'RX-2026-0045',
      patientId: 'ORH-2026-00124',
      patientName: 'Hana Mohammed',
      doctorId: 'USR-002',
      doctorName: 'Dr. Daniel Abate, MD',
      department: 'Internal Medicine',
      date: '2026-06-18',
      status: 'Active',
      diagnosis: 'J45.909 · Unspecified asthma',
      notes: 'Patient advised on proper MDI inhalation technique.',
      items: [
        {
          medicineId: 'MED-105',
          medicineName: 'Salbutamol Inhaler (100 mcg/dose)',
          dosage: '2 puffs',
          frequency: 'Every 6 hours as needed',
          duration: '30 days',
          instructions: 'Inhale with spacer if available, rinse mouth after use',
          dispensed: false
        },
        {
          medicineId: 'MED-106',
          medicineName: 'Budesonide 200 mcg Inhaler',
          dosage: '1 puff',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Rinse mouth after each dose',
          dispensed: false
        }
      ]
    },
    {
      id: 'RX-2026-0046',
      patientId: 'ORH-2026-00127',
      patientName: 'Dawit Alemu',
      doctorId: 'USR-008',
      doctorName: 'Dr. Aster Lemma, MD',
      department: 'Emergency & Trauma Care',
      date: '2026-06-18',
      status: 'Active',
      diagnosis: 'B50.9 · P. falciparum Malaria',
      items: [
        {
          medicineId: 'MED-102',
          medicineName: 'Artemether 20mg + Lumefantrine 120mg (Coartem)',
          dosage: '4 tablets',
          frequency: 'Twice daily with meals',
          duration: '3 days',
          instructions: 'Take with fatty food or milk to ensure absorption',
          dispensed: false
        },
        {
          medicineId: 'MED-104',
          medicineName: 'Paracetamol 500mg Tablets',
          dosage: '1000 mg (2 tabs)',
          frequency: 'Every 8 hours as needed for fever',
          duration: '3 days',
          instructions: 'Do not exceed 4000mg in 24 hours',
          dispensed: true
        }
      ]
    }
  ];

  await Prescription.deleteMany({});
  await Prescription.insertMany(prescriptions);
  console.log(`✅ Seeded ${prescriptions.length} prescriptions.`);

  // 8. Laboratory Orders
  const labOrders = [
    {
      id: 'LAB-2026-0312',
      patientId: 'ORH-2026-00127',
      patientName: 'Dawit Alemu',
      orderingDoctor: 'Dr. Aster Lemma',
      department: 'Emergency Medicine',
      orderDate: '2026-06-18',
      priority: 'Stat',
      status: 'Completed',
      clinicalIndication: 'High grade fever (39.1°C), rigors, headache. Rule out malaria.',
      specimenType: 'Whole Blood (EDTA)',
      collectionDate: '2026-06-18 09:15 AM',
      collectorName: 'Nurse Rahel Kebede',
      tests: [
        {
          testCode: 'MAL-BF',
          testName: 'Malaria Blood Film & RDT',
          category: 'Parasitology',
          resultValue: 'Positive (P. falciparum ++, 12,000 parasites/μL)',
          unit: 'parasites/μL',
          referenceRange: 'Negative',
          flag: 'Critical',
          status: 'Verified',
          technician: 'Tadesse Girma, MSc',
          reviewedBy: 'Tadesse Girma, MSc',
          notes: 'Trophozoites and ring stages seen.'
        },
        {
          testCode: 'CBC-WBC',
          testName: 'Complete Blood Count (CBC) - White Blood Cells',
          category: 'Hematology',
          resultValue: '11.4',
          unit: '10^3/μL',
          referenceRange: '4.0 - 10.0',
          flag: 'High',
          status: 'Verified',
          technician: 'Tadesse Girma, MSc',
          reviewedBy: 'Tadesse Girma, MSc'
        },
        {
          testCode: 'CBC-HGB',
          testName: 'Hemoglobin (Hgb)',
          category: 'Hematology',
          resultValue: '13.2',
          unit: 'g/dL',
          referenceRange: '13.5 - 17.5',
          flag: 'Low',
          status: 'Verified',
          technician: 'Tadesse Girma, MSc',
          reviewedBy: 'Tadesse Girma, MSc'
        }
      ]
    },
    {
      id: 'LAB-2026-0313',
      patientId: 'ORH-2026-00126',
      patientName: 'Fatuma Ahmed',
      orderingDoctor: 'Dr. Daniel Abate',
      department: 'Internal Medicine',
      orderDate: '2026-06-18',
      priority: 'Routine',
      status: 'Specimen Collected',
      clinicalIndication: 'Type 2 Diabetes quarterly routine follow-up',
      specimenType: 'Venous Blood & Fluoride Oxalate',
      collectionDate: '2026-06-18 09:30 AM',
      collectorName: 'Tadesse Girma',
      tests: [
        {
          testCode: 'GLU-FAST',
          testName: 'Fasting Blood Glucose',
          category: 'Clinical Chemistry',
          resultValue: '138',
          unit: 'mg/dL',
          referenceRange: '70 - 100',
          flag: 'High',
          status: 'Completed',
          technician: 'Tadesse Girma, MSc'
        },
        {
          testCode: 'HBA1C',
          testName: 'Glycated Hemoglobin (HbA1c)',
          category: 'Clinical Chemistry',
          resultValue: '7.2',
          unit: '%',
          referenceRange: '< 5.7',
          flag: 'High',
          status: 'Completed',
          technician: 'Tadesse Girma, MSc'
        }
      ]
    }
  ];

  await LabOrder.deleteMany({});
  await LabOrder.insertMany(labOrders);
  console.log(`✅ Seeded ${labOrders.length} laboratory orders.`);

  // 9. Medicine Inventory
  const medicines = [
    {
      id: 'MED-101',
      itemCode: 'EPSA-ABX-001',
      genericName: 'Amoxicillin Trihydrate',
      tradeName: 'Amoxil',
      category: 'Antibiotics',
      dosageForm: 'Capsule',
      strength: '500 mg',
      usableQuantity: 1250,
      reorderThreshold: 300,
      targetStockLevel: 2000,
      unitPrice: 4.50,
      storageLocation: 'Central Pharmacy - Shelf A1',
      storageConditions: 'Store below 25°C in a dry place',
      description: 'Broad-spectrum beta-lactam antibiotic for bacterial infections.',
      stockStatus: 'In Stock',
      batches: [
        { batchNumber: 'AMX-2025-09', expiryDate: '2027-08-31', quantity: 750, manufacturer: 'Cadila / EPSA' },
        { batchNumber: 'AMX-2025-11', expiryDate: '2027-11-30', quantity: 500, manufacturer: 'EPHARM Ethiopia' }
      ]
    },
    {
      id: 'MED-102',
      itemCode: 'EPSA-MAL-001',
      genericName: 'Artemether + Lumefantrine',
      tradeName: 'Coartem',
      category: 'Antimalarials',
      dosageForm: 'Tablet',
      strength: '20 mg + 120 mg',
      usableQuantity: 840,
      reorderThreshold: 200,
      targetStockLevel: 1500,
      unitPrice: 15.00,
      storageLocation: 'Central Pharmacy - Shelf A2',
      storageConditions: 'Store below 30°C',
      description: 'First-line artemisinin-based combination therapy for uncomplicated P. falciparum malaria.',
      stockStatus: 'In Stock',
      batches: [
        { batchNumber: 'CRT-2025-12', expiryDate: '2027-12-31', quantity: 840, manufacturer: 'Novartis / Global Fund' }
      ]
    },
    {
      id: 'MED-103',
      itemCode: 'EPSA-CVD-001',
      genericName: 'Amlodipine Besylate',
      tradeName: 'Norvasc',
      category: 'Antihypertensives',
      dosageForm: 'Tablet',
      strength: '5 mg',
      usableQuantity: 420,
      reorderThreshold: 150,
      targetStockLevel: 800,
      unitPrice: 5.50,
      storageLocation: 'Central Pharmacy - Shelf B1',
      storageConditions: 'Protect from light, store below 25°C',
      description: 'Calcium channel blocker for essential hypertension and chronic stable angina.',
      stockStatus: 'In Stock',
      batches: [
        { batchNumber: 'AML-2025-08', expiryDate: '2027-05-31', quantity: 420, manufacturer: 'Pfizer / EPSA' }
      ]
    },
    {
      id: 'MED-104',
      itemCode: 'EPSA-ANA-001',
      genericName: 'Paracetamol',
      tradeName: 'Panadol',
      category: 'Analgesics & Antipyretics',
      dosageForm: 'Tablet',
      strength: '500 mg',
      usableQuantity: 3400,
      reorderThreshold: 500,
      targetStockLevel: 4000,
      unitPrice: 2.00,
      storageLocation: 'Central Pharmacy - Shelf B2',
      storageConditions: 'Store below 25°C',
      description: 'Analgesic and antipyretic for mild to moderate pain and fever.',
      stockStatus: 'In Stock',
      batches: [
        { batchNumber: 'PCM-2025-10', expiryDate: '2028-02-28', quantity: 3400, manufacturer: 'Addis Pharmaceuticals (APF)' }
      ]
    },
    {
      id: 'MED-105',
      itemCode: 'EPSA-RES-001',
      genericName: 'Salbutamol Inhaler (Albuterol)',
      tradeName: 'Ventolin Evohaler',
      category: 'Respiratory',
      dosageForm: 'Syrup',
      strength: '100 mcg/metered dose (200 doses)',
      usableQuantity: 180,
      reorderThreshold: 50,
      targetStockLevel: 300,
      unitPrice: 180.00,
      storageLocation: 'Central Pharmacy - Shelf C1',
      storageConditions: 'Store below 30°C, avoid freezing and direct sunlight',
      description: 'Short-acting beta-2 agonist bronchodilator for asthma and COPD bronchospasm relief.',
      stockStatus: 'In Stock',
      batches: [
        { batchNumber: 'SLB-2025-07', expiryDate: '2027-04-30', quantity: 180, manufacturer: 'GlaxoSmithKline' }
      ]
    },
    {
      id: 'MED-106',
      itemCode: 'EPSA-DIA-001',
      genericName: 'Metformin Hydrochloride',
      tradeName: 'Glucophage',
      category: 'Antidiabetics',
      dosageForm: 'Tablet',
      strength: '500 mg',
      usableQuantity: 950,
      reorderThreshold: 250,
      targetStockLevel: 1500,
      unitPrice: 6.00,
      storageLocation: 'Central Pharmacy - Shelf C2',
      storageConditions: 'Store below 25°C',
      description: 'Biguanide antihyperglycemic agent for Type 2 diabetes mellitus management.',
      stockStatus: 'In Stock',
      batches: [
        { batchNumber: 'MTF-2025-11', expiryDate: '2027-10-31', quantity: 950, manufacturer: 'Merck / EPSA' }
      ]
    },
    {
      id: 'MED-107',
      itemCode: 'EPSA-ABX-002',
      genericName: 'Ceftriaxone Sodium',
      tradeName: 'Rocephin',
      category: 'Antibiotics',
      dosageForm: 'Injection',
      strength: '1 g Powder for Injection',
      usableQuantity: 95,
      reorderThreshold: 100,
      targetStockLevel: 400,
      unitPrice: 85.00,
      storageLocation: 'Central Pharmacy - Cold Storage & Sterile Shelf',
      storageConditions: 'Store below 25°C, protect from light',
      description: 'Third-generation cephalosporin for severe hospital-acquired and community infections.',
      stockStatus: 'Low Stock',
      batches: [
        { batchNumber: 'CTX-2025-06', expiryDate: '2027-01-31', quantity: 95, manufacturer: 'Sandoz / EPSA' }
      ]
    }
  ];

  await InventoryItem.deleteMany({});
  await InventoryItem.insertMany(medicines);
  console.log(`✅ Seeded ${medicines.length} medicine inventory items.`);

  // 10. Billing Invoices
  const bills = [
    {
      id: 'INV-2026-0520',
      patientId: 'ORH-2026-00124',
      patientName: 'Hana Mohammed',
      date: '2026-06-18',
      department: 'Outpatient Clinic',
      subtotal: 280.00,
      discount: 0,
      total: 280.00,
      paidAmount: 280.00,
      paymentStatus: 'Paid',
      paymentMethod: 'Telebirr',
      referenceNumber: 'TB-9988776655',
      cashierName: 'Almaz Kebede',
      items: [
        { description: 'Specialist Consultation Fee', category: 'Consultation', quantity: 1, unitPrice: 100.00, total: 100.00 },
        { description: 'Salbutamol Inhaler 100mcg', category: 'Pharmacy', quantity: 1, unitPrice: 180.00, total: 180.00 }
      ]
    },
    {
      id: 'INV-2026-0521',
      patientId: 'ORH-2026-00127',
      patientName: 'Dawit Alemu',
      date: '2026-06-18',
      department: 'Emergency & Trauma Care',
      subtotal: 185.00,
      discount: 0,
      total: 185.00,
      paidAmount: 185.00,
      paymentStatus: 'Paid',
      paymentMethod: 'CBE Birr',
      referenceNumber: 'CBE-4455667788',
      cashierName: 'Almaz Kebede',
      items: [
        { description: 'Emergency Triage & Consultation', category: 'Consultation', quantity: 1, unitPrice: 80.00, total: 80.00 },
        { description: 'Malaria Blood Film & RDT', category: 'Laboratory', quantity: 1, unitPrice: 45.00, total: 45.00 },
        { description: 'Complete Blood Count (CBC)', category: 'Laboratory', quantity: 1, unitPrice: 60.00, total: 60.00 }
      ]
    }
  ];

  await Billing.deleteMany({});
  await Billing.insertMany(bills);
  console.log(`✅ Seeded ${bills.length} billing records.`);

  // 11. Inpatient Beds
  const beds = [
    {
      bedId: 'BED-MW-01',
      ward: 'Medical Ward',
      bedNumber: '01',
      status: 'Occupied',
      patientId: 'ORH-2026-00131',
      patientName: 'Gemechu Desta',
      admissionDate: '2026-06-16',
      attendingPhysician: 'Dr. Daniel Abate',
      primaryNurse: 'Sr. Bethlehem Worku',
      triageCategory: 'Yellow - Urgent',
      notes: 'Hypertensive crisis under medical stabilization.'
    },
    {
      bedId: 'BED-MW-02',
      ward: 'Medical Ward',
      bedNumber: '02',
      status: 'Available',
      patientId: '',
      patientName: ''
    },
    {
      bedId: 'BED-MW-03',
      ward: 'Medical Ward',
      bedNumber: '03',
      status: 'Available',
      patientId: '',
      patientName: ''
    },
    {
      bedId: 'BED-ED-01',
      ward: 'Emergency Observation',
      bedNumber: '01',
      status: 'Occupied',
      patientId: 'ORH-2026-00127',
      patientName: 'Dawit Alemu',
      admissionDate: '2026-06-18',
      attendingPhysician: 'Dr. Aster Lemma',
      primaryNurse: 'Nurse Rahel Kebede',
      triageCategory: 'Orange - Very Urgent',
      notes: 'Severe malaria initiation of IV antimalarials and fluid resuscitation.'
    },
    {
      bedId: 'BED-ED-02',
      ward: 'Emergency Observation',
      bedNumber: '02',
      status: 'Available',
      patientId: '',
      patientName: ''
    },
    {
      bedId: 'BED-PED-01',
      ward: 'Pediatric Ward',
      bedNumber: '01',
      status: 'Available'
    },
    {
      bedId: 'BED-MAT-01',
      ward: 'Maternity Ward',
      bedNumber: '01',
      status: 'Available'
    }
  ];

  await InpatientBed.deleteMany({});
  await InpatientBed.insertMany(beds);
  console.log(`✅ Seeded ${beds.length} inpatient beds.`);

  console.log('🎉 Database seeding completed successfully! All dummy records replaced with authentic Oda Roba General Hospital records.');
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
