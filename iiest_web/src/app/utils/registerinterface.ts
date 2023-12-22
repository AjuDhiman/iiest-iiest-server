export interface Employee {
  employee_name: string;
  gender: string;
  dob: Date;
  username: string;
  email: string;
  password: string;
  company_name: string;
  employee_id: string;
  portal_type: string;
  project_name: string;
  doj: Date;
  department: string;
  designation: string;
  grade_pay: string
  salary: number;
  contact: number;
  alternate_contact: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: number;
  acceptTerms: boolean;
  createdBy: string;
  signatureFile: File;
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
  fbo_name: string,
  owner_name: string,
  owner_contact: number,
  email: string,
  state: string,
  district: string,
  address: string,
  product_name: string,
  processing_amount: string,
  service_name: string,
  client_type: string,
  recipient_no: number,
  water_test_fee: number,
  payment_mode : string,
  licence_category : string,
  licence_duration : string,
  total_amount: number,
  createdBy: string,
  pincode: number, 
  village: string, 
  tehsil: string
}

export interface fboRecipient {
  name: string;
  phoneNo: number;
  aadharNo: number;
}

export interface fboShop {
  operatorName :string;
  address : string;
  eBill: File;
}