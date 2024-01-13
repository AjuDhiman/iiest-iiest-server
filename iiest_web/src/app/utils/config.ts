export let config = {
   API_URL: 'http://localhost:3000/iiest'
   // API_URL: 'https://iiest-server.onrender.com'
}

//Water test Fee
export let waterTestFee = [0, 1500, 2000];
//Fostac Process Amount
export let processAmnt = [1200, 1500];
//Client Type
export let clientType = ['General Client', 'Corporate Client'];

//Payment Mode
export let paymentMode = ['Cash', 'Pay Page'];

export let licenceType = {
   'licenceCategory': ['New Licence', 'Renewal', 'Modified'],
   'Duration': ['1', '2', '3', '4', '5']
};
export let serviceNames = {
   "fostac": ["Retail", "Catering"],
   "foscos": ["Registration", "State"]
}

export let stateName = [
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


 // these roles are only ment for development purpose because these can any access route 
let master_roles = [   
   'Regional IT Manager',
   'Deputy Regional Manager(IT)',
   'IT Manager',
   'Deputy IT Manager',
   'Senior IT Associate',
   'IT Associate',
   'IT Developer',
   'Design Executive'
 ]

export let fbo_roles = [
   'General Manager(Sales)',
   'Regional Deputy Manager(Sales)',
   'Area Manager(Sales)',
   'Assistant Area Manager',
   'Area Officer(District Head)',
   'Senior Area Officer',
   'Area Associate Officer',
   'Area Officer',
   'Regional HR Manager',
   ...master_roles
];


export let empRegister_roles = [
   'Regional HR Manager',
   'Deputy Regional Manager(HR)',
   'Human Resource Manager',
   'Deputy Human Resource Manager(HR)',
   'Senior HR Associate',
   'HR Associate',
   'HR Coordiator',
   'Junior Executive(Admin & HR)',
   ...master_roles
 ];
