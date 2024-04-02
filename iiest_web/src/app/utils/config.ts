export const config = {
   API_URL: 'http://localhost:3000/iiest'
   // API_URL: 'https://iiest-server.onrender.com'
}

//Water test Fee
export const waterTestFee = [0, 1500, 2000];
//Fostac Process Amount
export const processAmnt = [1200, 1500];
//Client Type

export const hraProcessingAmnt = 5000;

export const clientType = ['General Client', 'Corporate Client'];

//Payment Mode
export const paymentMode = ['Cash', 'Pay Page'];

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
   "HRA": ["HRA"]
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
   ...master_roles
];

//roles array for showing highchart conditionally

export const salesManagerRoles = [
   'General Manager(Sales)',
   'Regional Deputy Manager(Sales)',
   'Area Manager(Sales)',
   'Assistant Area Manager'
];

export const batchListRoles = [
   'Technical Coordinator',
   ... master_roles
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

export const propratitorDocs: Array<{name: string, allowedFormats: string[], mutipleDoc: boolean}> = [
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

export const partnershipDocs: Array<{name: string, allowedFormats: string[], mutipleDoc: boolean}> = [
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

export const boardODirectorDocs: Array<{name: string, allowedFormats: string[], mutipleDoc: boolean}> = [
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

export const mandatoryDocs: Array<{name: string, allowedFormats: string[], mutipleDoc: boolean}> = [
   {
      name: 'FSMS Cerificate',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: false
   },
   {
      name: 'Pancard',
      allowedFormats: ['pdf', 'jpg', 'jpeg'],
      mutipleDoc: true
   }
];

export const manufacturingDoc: Array<{name: string, allowedFormats: string[], mutipleDoc: boolean}> = [
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

export const extraDoc: Array<{name: string, allowedFormats: string[], mutipleDoc: boolean}> = [
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

export const otherDocs: Array<{name: string, allowedFormats: string[], mutipleDoc: boolean}> = [
   {
      name:'Others',
      allowedFormats : ['png', 'jpg', 'jpeg', 'pdf'],
      mutipleDoc: true
   }
]

export const ourHolidays: Array<{ date: string, name: string }> = [
   { date: '2024-01-26', name: 'Republic Day' },
   { date: '2024-03-08', name: 'Mahashivratri' },
   { date: '2024-01-31', name: 'republic day' },
   { date: '2024-02-01', name: 'republic day' },
   { date: '2024-02-02', name: 'republic day' },
   { date: '2024-02-03', name: 'republic day' }
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
   otherChartTypeOptions: string[];

   constructor(chartType: string = 'column', department: string, chartTitle: string, seriesName: string, yAxisTitle: string, data: any, isDrilldown:boolean, showIntervalSelection = false, otherChartTypeOptions: string[] = []) {
      this.chartType = chartType;
      this.department = department;
      this.chartTitle = chartTitle;
      this.seriesName = seriesName;
      this.yAxisTitle = yAxisTitle;
      this.data = data;
      this.isDrilldown = isDrilldown 
      this.showIntervalSelection = showIntervalSelection;
      this.otherChartTypeOptions = otherChartTypeOptions;
   }
}

export const days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thrusday', 'Friday', 'Saturday'];

export const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];