import visitor from '../../images/project/01.png';
import jawahar from '../../images/project/02.png';
import handbook from '../../images/project/03.png';
import tgtexam from '../../images/project/04.png';
import appraisal from '../../images/project/05.png';
import intranet from '../../images/project/06.png';
import tour from '../../images/project/07.png';
import training from '../../images/project/08.png';
import osms from '../../images/project/09.png';
import helpdesk from '../../images/project/10.png';
import assets from '../../images/project/11.png';
import learning from '../../images/project/12.png';
import tgt from '../../images/project/13.png';
import timeoffice from '../../images/project/14.png';

export const projects = [
  {
    title: "Employee Handbook",
    summary: "A digital handbook built for newly joined TGT employees at RSWM Ltd (LNJ Group). The app provides new employees with onboarding detail, company policies, structure, values, first-day responsibilities, vision, leave details, CSR and a Whiteboard to share their thoughts. A web portal for admins to manage user access, view feedback, Whiteboard submissions reports.",
    image: handbook,
    tech: ["flutter", "dart", "html5", "css3", "bootstrap5", "php", "mysql", "rest-api"],
    link: "https://play.google.com/store/apps/details?id=com.app.handbook&pcampaignid=web_share",
    direction: "fade-left",
  },
  {
    title: "Visitor Management System",
    summary: "A smart system to manage check-ins and check-outs across multiple plant locations. It captures visitor details and photos, sends automated email notifications to hosts, records gatekeeper exit remarks, and provides admins access to plant-wise and daily reports via the web portal ensuring secure, efficient, and organized visitor handling.",
    image: visitor,
    tech: ["android", "html5", "css3", "bootstrap5", "javascript", "php", "mysql", "rest-api"],
    link: "https://play.google.com/store/apps/details?id=lnjb.rswm.visitor&pcampaignid=web_share",
    direction: "fade-left",
  },
  {
    title: "Indra Rasoi System",
    summary: "A food distribution system in App and Web Portal. The app allows staff to register beneficiaries, record meal type (lunch/dinner), and capture photos of food plates and hygiene practices at the point of service. In web portal admins access real-time reports for monitoring and analysis, quality control, and efficient management of the welfare initiative.",
    image: jawahar,
    tech: ["android", "html5", "css3", "bootstrap5", "javascript", "php", "mysql", "rest-api"],
    link: "https://play.google.com/store/apps/details?id=com.lotus.jawahar&pcampaignid=web_share",
    direction: "fade-right",
  },
  {
    title: "Online Examination System",
    summary: "A recruitment platform to evaluate candidates through MCQ-based online assessments. The system facilitates simultaneous examinations across multiple colleges and offers robust administrative tools to manage institutions, student streams, and question banks. Real-time monitoring and automated result generation enable instant evaluation, with downloadable, college-wise reports for streamlined shortlisting. Candidates scoring above the defined threshold (40%) are automatically shortlisted, ensuring a transparent, scalable, and efficient campus hiring process.",
    image: tgtexam,
    tech: ["html5", "css3", "bootstrap5", "javascript", "jQuery", "php", "mysql"],
    link: "https://apps.lnjbhilwara.com/onexam/stud/",
    direction: "fade-right",
  },
  {
    title: "Appraisal System",
    summary: "Manages employee evaluations through structured review levels (L1 to L5). Senior employees complete self-assessments, including uploading their KRA, JD, and key achievements. Junior employees are assessed by their reporting managers or HODs, based on organizational hierarchy. Once submitted, each appraisal follows a sequential review process—first by the reporting manager, then by a reviewing authority—before final summary submission to the COO and Business Head for plant-wise and business-wise evaluation. This ensures a transparent, structured, and policy-driven performance management system.",
    image: appraisal,
    tech: ["html5", "css3", "bootstrap5", "javascript", "jQuery", "php", "mysql"],
    link: "#",
    direction: "fade-left",
  },
  {
    title: "Intranet System",
    summary: "Employee self-service access to daily work-related information and services. The system enables employees to view their salary slips, attendance records, correction requests, apply for and track leave, personal loans, PF, LTA, and income tax details. It also supports HR and HOD-level corrections, internal complaint/service request submissions, and access to personal and organizational information such as company policies, ethics, and certificates. Additionally, internal activities with photo and video galleries to enhance employee engagement and help staff better understand the organization.",
    image: intranet,
    tech: ["html5", "css3", "bootstrap5", "javascript", "jQuery", "php", "mysql", "sql"],
    link: "https://apps.lnjbhilwara.com/intra/",
    direction: "fade-left",
  },
  {
    title: "Excursions Tour System",
    summary: "Manage group tours for employees and their families across various locations such as Gangtok, Shimla–Manali, Sikkim, and Darjeeling. It allows employees to register for the tour, enter personal and family details (including name, DOB, age, location, Aadhaar number), and accommodation preferences. It also facilitates backend coordination of travel and lodging arrangements, ensuring a smooth and organized 7-day experience inclusive of food and travel for all participants.",
    image: tour,
    tech: ["html5", "css3", "bootstrap5", "javascript", "jQuery", "php", "mysql"],
    link: "#",
    direction: "fade-right",
  },
  {
    title: "Training System",
    summary: "A centralized platform to manage and track departmental training programs across the organization. It allows departments to log training details such as training type, date, subject, trainer information, and total training hours. The system also supports digital reporting, enabling easy access to accurate training records for internal tracking and external audits—ensuring transparency, compliance, and continuous skill development across teams.",
    image: training,
    tech: ["html5", "css3", "bootstrap5", "javascript", "jQuery", "php", "sql"],
    link: "https://apps.lnjbhilwara.com/training/",
    direction: "fade-right",
  },
  {
    title: "Lapdip Track System",
    summary: "A collaboration between the marketing and plant teams for managing lapdip sample requests. Marketing person log customer sample requests, which are received by the respective plant teams for processing and production. Once prepared, the samples are dispatched back to marketing, who then forward them to the customers. The system also captures customer feedback, ensuring end-to-end tracking from request.",
    image: osms,
    tech: ["html5", "css3", "bootstrap5", "javascript", "jQuery", "php", "sql"],
    link: "https://apps.lnjbhilwara.com/osms/",
    direction: "fade-left",
  },
  {
    title: "Worker’s Helpdesk",
    summary: "A digital platform that enables workers to access their daily attendance records, productive work hours, and key personal information such as employee code, leave balance, and PAN. This system promotes transparency and accountability by allowing workers to monitor their presence and performance, helping both employees and management stay aligned on attendance and productivity metrics.",
    image: helpdesk,
    tech: ["html5", "css3", "bootstrap5", "javascript", "jQuery", "php", "sql"],
    link: "https://apps.lnjbhilwara.com/helpdesk/",
    direction: "fade-left",
  },
  {
    title: "IT Assets Management",
    summary: "A centralized platform to manage IT assets across the organization by tracking asset allocation, usage history, and maintenance requests. The system categorizes service calls into primitive and non-primitive types, enabling efficient tracking and resolution. Each asset is tagged with a unique ID, allowing administrators to monitor ownership, location, and maintenance history ensuring transparency, accountability",
    image: assets,
    tech: ["html5", "css3", "bootstrap5", "javascript", "jQuery", "php", "mysql"],
    link: "https://apps.lnjbhilwara.com/it/admin/",
    direction: "fade-right",
  },
  {
    title: "Self Learning Tools",
    summary: "A centralized learning portal at the group level where employees can upload, access, and manage training materials and educational content. Access is secured through Active Directory login credentials, ensuring authenticated entry. All uploaded content undergoes an approval process managed by the IT department to maintain quality and compliance—promoting continuous learning and knowledge sharing across the organization.",
    image: learning,
    tech: ["html5", "css3", "bootstrap5", "javascript", "jQuery", "php", "mysql"],
    link: "https://apps.lnjbhilwara.com/learning/admin/",
    direction: "fade-right",
  },

  {
    title: "Trainee Record System",
    summary: "Manage trainees by assigning them to plants and departments, with supervisors guiding them individually or in groups, assign project topics, and track daily work logs. Final project presentations are uploaded at the end.",
    image: tgt,
    tech: ["html5", "css3", "bootstrap5", "javascript", "jQuery", "php", "mysql"],
    link: "https://apps.lnjbhilwara.com/tgt/",
    direction: "fade-right",
  },
  {
    title: "Time Office",
    summary: "Manage worker attendance confirmations (PP, AA, RR) by plant officers with cross-verification. After initial approval, attendance data is submitted to the Time Officer for final confirmation and record-keeping.",
    image: timeoffice,
    tech: ["html5", "css3", "bootstrap5", "javascript", "jQuery", "php", "mysql"],
    link: "https://apps.lnjbhilwara.com/timeoffice/",
    direction: "fade-left",
  },
];
