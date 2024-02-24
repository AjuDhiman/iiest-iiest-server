export const config = {
   API_URL: 'http://localhost:3000/iiest'
   // API_URL: 'https://iiest-server.onrender.com'
}

//Water test Fee
export const waterTestFee = [0, 1500, 2000];
//Fostac Process Amount
export const processAmnt = [1200, 1500];
//Client Type
export const clientType = ['General Client', 'Corporate Client'];

//Payment Mode
export const paymentMode = ['Cash', 'Pay Page'];

export const ownershipType = [
   'propraitorship',
   'partnership',
   'board of directors'
]

export const licenceType = {
   'licenceCategory': ['New Licence', 'Renewal', 'Modified'],
   'Duration': ['1', '2', '3', '4', '5']
};
export const serviceNames = {
   "fostac": ["Retail", "Catering"],
   "foscos": ["Registration", "State"]
}



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
   'deputy Regional Manager(Project)',
   'Project Manager',
   'Deputy Training Manager',
   'Senior Project Associate',
   'Project Associate',
   'Project Coordinator',
   ...master_roles
]

//roles array for showing highchart conditionally

export const salesManagerRoles = [
   'General Manager(Sales)',
   'Regional Deputy Manager(Sales)',
   'Area Manager(Sales)',
   'Assistant Area Manager'
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

// export const ourHolidays: any = [
//    { date: '2024-01-25T08:12:11.000Z', name: 'public holiday' },
//    { date: '2024-01-26T08:12:11.000Z', name: 'republic day' }
// ]

export const ourHolidays: Array<{ date: string, name: string }> = [
   { date: '2024-01-25', name: 'public holiday' },
   { date: '2024-01-26', name: 'republic day' },
   { date: '2024-01-30', name: 'republic day' },
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
   drillData: any;
   showIntervalSelection: boolean;
   otherChartTypeOptions: string[];

   constructor(chartType: string = 'column', department: string, chartTitle: string, seriesName: string, yAxisTitle: string, data: {}, drillData: any, showIntervalSelection = false, otherChartTypeOptions: string[] = []) {
      this.chartType = chartType;
      this.department = department;
      this.chartTitle = chartTitle;
      this.seriesName = seriesName;
      this.yAxisTitle = yAxisTitle;
      this.data = data;
      this.drillData = drillData;
      this.showIntervalSelection = showIntervalSelection;
      this.otherChartTypeOptions = otherChartTypeOptions;
   }
}

export const days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thrusday', 'Friday', 'Saturday'];

export const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];