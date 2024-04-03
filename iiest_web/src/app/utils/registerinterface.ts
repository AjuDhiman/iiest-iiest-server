export interface Employee {
  employee_name: string;
  gender: string;
  dob: Date;
  username: string;
  email: string;
  password: string;
  company_name: string;
  employee_id: string;
  panel_type: string;
  project_name: string;
  doj: Date;
  post_type: string;
  department: string;
  designation: string;
  pay_band: string
  salary: number;
  contact_no: number;
  alternate_contact: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: number;
  acceptTerms: boolean;
  createdBy: string;
  empSignature: File;
  employeeImage: File;
  _id: string;
}

export interface AddConsumer {
  name: string;
  job: string;
  id: string;
  createdAt: string;
}
export interface loginEmployee {
  username: string;
  password: string;
}

export interface forgotPassword {
  email: string;
}

export interface fbo {
  fbo_name: string;
  owner_name: string;
  owner_contact: number;
  email: string;
  state: string;
  district: string;
  address: string;
  product_name: string[];
  business_type: string[];
  gst_number: string;
  fostacInfo: object;
  foscosInfo: object;
  payment_mode: string;
  grand_total: number;
  createdBy: string;
  pincode: number;
  village: string;
  tehsil: string
  foscos_training: {
    foscos_service_name: string;
    license_category: string;
    license_duration: string;
    foscos_processing_amount: number;
    foscos_client_type: string;
    shops_no: number;
    water_test_fee: string;
    foscos_total: number
  },
  fostac_training: {
    fostac_service_name: string;
    fostac_processing_amount: string;
    fostac_client_type: string;
    recipient_no: number;
    fostac_total: number
  }
}

export interface fboRecipient {
  name: string;
  phoneNo: number;
  aadharNo: number;
}

export interface fboShop {
  operatorName: string;
  address: string;
  eBill: File;
}

export interface pincodeData {
  PostOfficeName: string;
  Pincode: string;
  City: string;
  District: string;
  State: string;
}

export interface areaAllocation {
  state: string;
  district: string;
  pincodes: string[]
}

export interface reportingManager {
  reportingManager: string;
}

export interface editUserFiles {
  userImage: File,
  userSign: File
}

export interface userInerface {
  address: string;
  alternate_contact: number;
  city: string;
  company_name: string;
  contact_no: number;
  country:string;
  createdAt: string;
  createdBy: string;
  department: string;
  designation: string;
  dob: string;
  doj: string;
  email: string
  employeeImage: string;
  employee_id: string;
  employee_name: string;
  gender: string;
  id_nun: number; 
  lastEdit: string;
  panel_type: string;
  password: string;
  pay_band: string;
  post_type: string;
  project_name: string;
  salary: number;
  signatureImage: string;
  state: string;
  status: boolean;
  username: string;
  zip_code: number;
  _id: string
}

export interface fostacVerification{
  recipient_name:string,
  fbo_name:string,
  owner_name:string,
  father_name:string,
  dob:Date,
  address:string,
  recipient_contact_no:number,
  email:string,
  aadhar_no:number,
  pancard_no:string,
  fostac_total:string,
  sales_person:string,
  officer_name: string,
  username:string,
  password:string
}

export interface foscosVerification {
  operator_name: string,
  fbo_name: string,
  owner_name: string,
  operator_contact_no: string,
  email: string,
  address: string,
  pincode: string,
  village: string,
  tehsil: string,
  kob: string,
  food_category: string,
  license_category: string,
  license_duration: string,
  foscos_total: string,
  sales_date: string,
  sales_person: string,
}

export interface hraVerification {
  manager_name: string,
  fbo_name: string,
  owner_name: string,
  manager_contact_no: string,
  email: string,
  address: string,
  pincode: string,
  kob: string,
  hra_total: string,
  sales_date: string,
  sales_person: string,
}

export interface fostacEnrollment{
  tentative_training_date:Date,
  fostac_training_date: Date,
  roll_no: string;
}

export interface operGeneralSection{
  recipient_status:string,
  officer_note:string
}

export interface fostacAttendance{
  attendee_status:string,
  marks:Number
}

export interface sales{
  _id: string,
  employeeInfo:[],
  fboInfo: [],
  product_name:[],
  fostacInfo: {},
  foscosInfo: {},
  payment_mode: string,
  checkStatus: string,
  grand_total: number,
  invoiceId: string,
  createdAt: string
}