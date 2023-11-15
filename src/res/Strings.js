const common = {
  welcomeBack: 'Welcome Back',
  splashDescription: 'Superior scheduling system\nfor cleaning companies.',
  submit: 'Submit',
  cancel: 'Cancel'
}

const registration = {
  signIn: 'Sign In',
  signUp: 'Sign Up',
  next: 'Next',
  loginAccount: 'Login to your account',
  buinessAdmin: 'Business Admin',
  businessInfo: 'Business Information',
  employee: 'Employee',
  login: 'Login',
  forgotPwd: 'Forgot Password?',
  forgotPassword: 'Forgot Password',
  passwordReset: 'Password Reset',
  privacyPolicy: 'Privacy Policy',
  termsConditions: 'Terms and conditions',
  tokenInput: 'Token Input',
  resendToken: 'Resend token',
  enterCode: 'Enter the One Time Password sent to your email',
  enterEmail: 'Please enter your email address in order to reset your password',
  personalInfo: 'Personal Information',
  emergencyContact: 'Emergency Contact',
  uploadPhoto: 'Upload Photo',
  descriptionPrivacy:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. '
}

const subcription = {
  chooseSubscription: 'Choose your Subscription',
  subscribe: 'Subscribe',
  basicOffer: 'Basic Offer'
}

const forms = {
  phoneLabel: 'Phone Number e.g. +1-111-222-3333',
  password: 'Enter password',
  firstNameLabel: 'First Name e.g. John',
  lastNameLabel: 'Last Name e.g. Doe',
  businessNameLabel: 'Business Name e.g. CleanR Corp',
  passwordLabel: 'Create a Password',
  emailLabel: 'Email Address e.g. john@gmail.com',
  emailPhoneLabel: 'Email OR Mobile Number',
  passwordContain: 'Password must contain:',
  position: 'Position',
  role: 'Role',
  addressLine1: 'Address line 1 e.g. 19, Wall Street',
  addressLine2: 'Address line 2',
  city: 'City',
  birthdayLabel: 'Birth Date',
  pricePerHr: 'Hourly Rate',
  workInfo: 'Work Information',
  worksiteLocation: 'Worksite Location e.g Park Avenue',
  worksiteName: 'Worksite Name e.g. Tall Tower',
  notes: 'Notes',
  monthlyRate: 'Monthly Rate',
  cleaningFreq: 'Cleaning frequency by day',
  desiredTime: 'Designated Start Time',
  numWorkers: 'Number of workers needed',
  supplies: 'Supplies needed',
  name: 'Name',
  taskName: 'Task Name',
  criticality: 'Criticality',
  taskFreq: 'Frequency of task',
  title: 'Title',
  leaveType: 'Type of request',
  payFreq: 'Pay Frequency'
}

const employee = {
  addressInfo: 'Business Address',
  workInfo: 'Work Information',
  contact: 'Contact',
  addEmployee: 'Add Employee',
  updateEmployee: 'Update Employee',
  worksites: 'Worksites',
  listWorksites: 'List of my worksites',
  worksiteInfo: 'Worksite Information',
  contactInfo: 'Contact Person',
  createTask: 'Create a task',
  edit: 'Edit',
  deleteWorksite: 'Delete worksite',
  addWorksite: 'Add Worksite',
  updateWorksite: 'Update Worksite',
  uploadWorksiteLogo: 'Upload worksite logo',
  uploadVideo: 'Upload instruction video',
  save: 'Save',
  description: 'Description',
  worksiteNumber: 'Worksite Number',
  uploadMedia: 'Upload media',
  create: 'Create'
}

const home = {
  upcomingShift: 'Upcoming shift',
  clockIn: 'Clock in',
  activeEmployees: 'Active employees',
  payPeriod: 'Pay period to date:'
}

const settings = {
  settings: 'Settings',
  changePassword: 'Change Password',
  worksiteFeedback: 'Worksite feedback',
  logoutDes: 'Are you sure you want to logout?',
  logout: 'Logout',
  sendReq: 'Send Request',
  timeOffReq: 'Time off Request',
  approve: 'Approve',
  deny: 'Deny',
  send: 'Send',
  message: 'Message',
  reasonForDeny: 'Reason for denying'
}

const payment = {
  cardHolderDets: 'Card Holder Details',
  cardDets: 'Card Details',
  update: 'Update',
  paymentHistory: 'Payment History',
  paymentMethod: 'Payment Method',
  paymentsTitle: 'Payments',
  deletePayment: 'Delete payment method',
  changePayment: 'Change payment method'
}

const messages = {
  messagesTitle: 'Messages',
  searchConversation: 'Search for a conversation',
  newMessage: 'New Message'
}

module.exports = {
  ...common,
  ...settings,
  ...registration,
  ...forms,
  ...subcription,
  ...employee,
  ...home,
  ...payment,
  ...messages
}
