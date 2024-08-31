const testEnv = true;
const prodEnv = false;

export const config = {
   API_URL: prodEnv?'https://connectonline.world:3001':(testEnv?'https://connectonline.world:3001/iiest':'http://localhost:3000/iiest'),
   // API_URL: 'https://iiest-server.onrender.com'
   DOC_URL: prodEnv?'https://connectonline.world:3001':(testEnv?'https://connectonline.world:3001':'http://localhost:3000') //this url is the loaction in backend from where static file like pdf or images are avilable for download for backend see index.js in server 
}

export const panIndiaAllowedEmpIds = [ //Employees with Pan India Employee Id
   'IIEST/FD/0176', //Chetan Kapoor Emp Id
   'IIEST/FD/5187', //Sales test Emp Id
   'IIEST/FD/8234' //Rohit Kulshrestha Emp Id
]
// export const chetanKapoorEmpId: string = 'IIEST/FD/0176';

//Water test Fee
export const waterTestFee = [0, 1500, 2000, 2500];
//Fostac Process Amount
export const processAmnt = [1200, 1500];
export const khadyaPaalnProcessAmnt = 12999;
//Client Type

export const waterTestProcessAmnt = 2500;
export const medicalProcessAmnt = 678;

export const hraProcessingAmnt = 5000;

export const clientType = ['Single Recipient', 'Multiple Recipient'];

//Payment Mode
export const paymentMode = ['Pay Page', 'By Cheque', 'Pay Later'];

export const auditers = [
   'Aditi',
   'Umar'
];

export const trainers = [
   'Aditi',
   'Amit Khanna',
   'Vijay Saini',
   'Vinay Kumar Stphene',
   'Yashwanth Murthy',
   'Yashodha Devi Palkna',
   'Harshvardhan Tmrakr',
   'Praduman Kumar'
];

export const venues: {name: string, vendor: string, location: string}[] = [
   {
      name: 'IIEST',
      vendor: 'IIEST',
      location: 'Delhi'
   },
   {
      name: 'Imperial Banquet',
      vendor: 'Greenvilley',
      location: 'Gurugram'
   },
   {
      name: 'Indian Resort and Restaurant',
      vendor: 'Indian Resort and Restaurant',
      location: 'Faridabad'
   },
   {
      name: 'Hotel Howdy',
      vendor: 'Hotel Howdy',
      location: 'Faridabad'
   },
   {
      name: 'Radient Hospitality',
      vendor: 'Radient Hospitality',
      location: 'Noida'
   },
   {
      name: 'Hotel Samrath',
      vendor: 'Perfect Celebrations',
      location: 'Kaushambi'
   },
   {
      name: 'Yo Food',
      vendor: 'Parky HVAC India Pvt. Ltd.',
      location: 'Delhi'
   },
]

export const ownershipType = [
   'Propraitorship',
   'Partnership',
   'Board of Directors'
];

export const licenceType = {
   'licenceCategory': ['New Licence', 'Renewal', 'Modified'],
   'Duration': ['1', '2', '3', '4', '5']
};
export const serviceNames = {
   "fostac": ["Retail", "Catering", "Others"],
   "foscos": ["Registration", "State"],
   "HRA": ["HRA"],
   "water_test_report": ["NABL", "Non NABL"],
}

export const hraKob: string[] = [
   'Meat Shop',
   'Sweet Shop',
   'Bakery Shop',
   'Catering'
]

export const stateName = [
   'Andaman Nicobar', 'Andhra Pradesh',
   'Arunachal Pradesh', 'Assam',
   'Bihar', 'Chandigarh',
   'Chhattisgarh', 'Dadra & Nagar Haveli',
   'Daman & Diu', 'Delhi',
   'Goa', 'Gujarat',
   'Haryana', 'Himachal Pradesh',
   'Jammu & Kashmir', 'Jharkhand',
   'Karnataka', 'Kerala',
   'Lakshdweep', 'Madhya Pradesh',
   'Maharashtra', 'Manipur',
   'Meghalaya', 'Mizoram',
   'Nagaland', 'Orissa',
   'Pondicherry', 'Punjab',
   'Rajasthan', 'Sikkim',
   'Tamil Nadu', 'Tripura',
   'Uttar Pradesh', 'Uttaranchal',
   'West Bengal'
]


//role arraysroutes 

//master_roles
const master_roles = [
   'Director',
   'Regional IT Manager',
   'Deputy Regional Manager(IT)',
   'IT Manager',
   'Deputy IT Manager',
   'Senior IT Associate',
   'IT Associate',
   'IT Developer',
   'Design Executive'
]

export const fbo_roles = [
   'General Manager(Sales)',
   'Regional Deputy Manager(Sales)',
   'Area Manager(Sales)',
   'Assistant Area Manager',
   'Area Officer(District Head)',
   'Senior Area Officer',
   'Area Associate Officer',
   'Area Officer',
   ...master_roles
];

export const bookSaleRoles = [
   'General Manager(Sales)',
   'Regional Deputy Manager(Sales)',
   'Area Manager(Sales)',
   'Assistant Area Manager',
   'Area Officer(District Head)',
   'Senior Area Officer',
   'Area Associate Officer',
   'Area Officer',
]

export const empRegister_roles = [
   'Regional HR Manager',
   'Deputy Regional Manager(HR)',
   'Human Resource Manager',
   'Deputy Human Resource Manager(HR)',
   'Senior HR Associate',
   'HR Associate',
   'HR Coordinator',
   'Junior Executive(Admin & HR)',
   ...master_roles
];

export const caseList_roles = [
   'Regional Project Manager',
   'Deputy Regional Manager(Project)',
   'Project Manager',
   'Deputy Training Manager',
   'Senior Project Associate',
   'Project Associate',
   'Project Coordinator',
   'Technical Coordinator',
   'Technical Associate'
];

//roles of directors
export const director_roles = [
   'Director'
]

//roles array for showing highchart conditionally

export const salesManagerRoles = [
   'General Manager(Sales)',
   'Regional Deputy Manager(Sales)',
   'Area Manager(Sales)',
   'Assistant Area Manager'
];

export const batchListRoles = [
   'Technical Coordinator',
   ...master_roles
]

export const delhiTrainingLocations = [
   "Delhi",
   "Noida",
   "Gurgaon",
   "Faridabad",
   "Ghaziabad"
]

export const salesOfficersRoles = [
   'Area Officer(District Head)',
   'Senior Area Officer',
   'Area Associate Officer',
   'Area Officer',
   'Workshop Mobiliser',
   'Director',
   ...master_roles
]

export const HrRoles = [
   'Regional HR Manager',
   'Deputy Regional Manager(HR)',
   'Human Resource Manager',
   'Deputy Human Resource Manager(HR)',
   'Senior HR Associate',
   'HR Associate',
   'HR Coordinator',
   'Junior Executive(Admin & HR)',
   ...master_roles
]

export const foscosDocments = [
   'FSMS Certificate',
   'List of Directors',
   'List of Partners',
   'List of Propraitors',
   'Partnership Deed',
   'NOC', //in case if rent aggrement is not on propraitor's name
   'Self Decleration of Propraitorship',
   'MOU',
   'Form IX',
   'Rent Aggrement',
   'Pancard',
   'Water Test Report',
   'ICE',
   'Recall Plan',
   'List of Vehicle Registration Number',
   'Sale Deed',
   //for manufacturing KOBs
   'Blue Print of Proessing Unit',
   'List of Equipments',
   'Photograph of Equipments',
   'NOC From MCD',
   'NOC From Manufacturer',
   'Source of Raw Matireal',
   'Others'
];

export const hraDocuments = [
   {
      name: 'Cooking Temp Format',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: true
   },
   {
      name: 'Food Chilling Temp Format',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: true
   },
   {
      name: 'Food Holding Temp Format',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: true
   },
   {
      name: 'Food Transport Vehicle Inspection Format',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: true
   },
   {
      name: 'Incoming Material Inspection Format',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: true
   },
   {
      name: 'Personal Cleanliness Format',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: true
   },
   {
      name: 'Thawing Temp Format',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: true
   },
   {
      name: 'Photos',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: true
   }
];

//array of all basic required docs for customer realtions form
export const basicRequiredDocs = [
   {
      product_name: 'Fostac',
      display_name: 'Fostac Certificate',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false,
      isChecked: false,
      isAlreadyAvilable: false,
      isSelectedForSale:  false,
      isPendingByCustomer: false,
      isActiveProduct: false
   },
   {
      display_name: 'Water Test Report',
      product_name: 'Water Test Report',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false,
      isChecked: false,
      isAlreadyAvilable: false,
      isSelectedForSale:  false,
      isPendingByCustomer: false,
      isActiveProduct: false
   },
   {
      display_name: 'Medical Certificate',
      product_name: 'Medical',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false,
      isChecked: false,
      isAlreadyAvilable: false,
      isSelectedForSale:  false,
      isPendingByCustomer: false,
      isActiveProduct: false
   },
   {
      display_name: 'Foscos License',
      product_name: 'Foscos',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false,
      isChecked: false,
      isAlreadyAvilable: false,
      isSelectedForSale:  false,
      isPendingByCustomer: false,
      isActiveProduct: false
   },
   {
      display_name: 'HRA',
      product_name: 'HRA',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false,
      isChecked: false,
      isAlreadyAvilable: false,
      isSelectedForSale:  false ,
      isPendingByCustomer: false,
      isActiveProduct: false
   },
];

export const hraRequiredDocs = [
   {
      name: 'Water Test Report',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Medical Certificates',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Fostac Certificate',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Foscos License',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
];


export const fostacDocs = [
   {
      name: 'Water Test Report',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Medical Certificates',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Fostac Certificate',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Foscos License',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
];

export const propratitorDocs: Array<{ name: string, allowedFormats: string[], mutipleDoc: boolean }> = [
   {
      name: 'List of Propraitors',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Self Decleration of Propraitorship',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   }
]

export const partnershipDocs: Array<{ name: string, allowedFormats: string[], mutipleDoc: boolean }> = [
   {
      name: 'List of Partnership',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Partnership Deed',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'FORM IX',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   }
]

export const boardODirectorDocs: Array<{ name: string, allowedFormats: string[], mutipleDoc: boolean }> = [
   {
      name: 'List of Directors',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'MOU',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'FORM IX',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   }
]

export const mandatoryDocs: Array<{ name: string, allowedFormats: string[], mutipleDoc: boolean }> = [
   {
      name: 'FSMS Cerificate',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Pancard',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: true
   },
   {
      name: 'Electricity Bill',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
];

export const manufacturingDoc: Array<{ name: string, allowedFormats: string[], mutipleDoc: boolean }> = [
   {
      name: 'Blue Print of Proessing Unit',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'List of Equipments',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Recall Plan',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: true
   },
   {
      name: 'Water Test Report', //if 
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   }
];

export const extraDoc: Array<{ name: string, allowedFormats: string[], mutipleDoc: boolean }> = [
   {
      name: 'Source or Procurement Plan for Milk',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Source of Raw Matireal',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'NOC From MDC',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: true
   },
   {
      name: 'NOC From Manufacturer',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Analysis Report',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'IEC by DGFT',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Sale Deed',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'List of Vehicle Registration Number',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   }
];

export const otherDocs: Array<{ name: string, allowedFormats: string[], mutipleDoc: boolean }> = [
   {
      name: 'Others',
      allowedFormats: ['png', 'jpg', 'jpeg', 'pdf'],
      mutipleDoc: true
   }
]

export const ourHolidays: Array<{ date: string, name: string }> = [
   { date: '2024-01-26', name: 'Republic Day' },
   { date: '2024-03-08', name: 'Mahashivratri' },
   { date: '2024-04-25', name: 'Holi' },
   { date: '2024-04-29', name: 'Good Friday' },
   { date: '2024-04-11', name: 'Eid Al-Fitr' },
   { date: '2024-06-17', name: 'Eid Al-Zuha(Bakrid)'},
   { date: '2024-08-15', name: 'Independence Day'},
   { date: '2024-08-19', name: 'Raksha Bandhan'},
   { date: '2024-09-26', name: 'Janmashtami'},
   { date: '2024-10-02', name: 'Gandhi Jayanti'},
   { date: '2024-10-12', name: 'Dussehra'},
   { date: '2024-11-01', name: 'Diwali'},
   { date: '2024-11-02', name: 'Govardhan Pooja'},
   { date: '2024-11-03', name: 'Bhai Dooj'},
   { date: '2024-12-25', name: 'Christmas'},
]

export class chartData {
   chartType: string;
   department: string;
   chartTitle: string;
   seriesName: string;
   yAxisTitle: string;
   data: any;
   isDrilldown: any;
   showIntervalSelection: boolean;
   selectedInterval: string;
   otherChartTypeOptions: string[];

   constructor(chartType: string = 'column', department: string, chartTitle: string, seriesName: string, yAxisTitle: string, data: any, isDrilldown: boolean, showIntervalSelection = false, selectedInterval = '', otherChartTypeOptions: string[] = []) {
      this.chartType = chartType;
      this.department = department;
      this.chartTitle = chartTitle;
      this.seriesName = seriesName;
      this.yAxisTitle = yAxisTitle;
      this.data = data;
      this.isDrilldown = isDrilldown;
      this.showIntervalSelection = showIntervalSelection;
      this.selectedInterval = selectedInterval;
      this.otherChartTypeOptions = otherChartTypeOptions;
   }
}

export const days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thrusday', 'Friday', 'Saturday'];

export const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export const Months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

