import { Colors, Images, Strings } from '../../res'

const fields = {
  first_name: {
    key: 'first_name',
    dateType: false,
    label: Strings.firstNameLabel,
    placeholder: Strings.firstNameLabel,
    regex: /^[a-zA-Z- .' \\s ]*$/,
    textInputProps: { autoCapitalize: 'words' }
  },
  last_name: {
    key: 'last_name',
    dateType: false,
    label: Strings.lastNameLabel,
    placeholder: '',
    regex: /^[a-zA-Z- .' \\s ]*$/,
    textInputProps: { autoCapitalize: 'words' }
  },
  first_name1: {
    key: 'first_name1',
    dateType: false,
    label: Strings.firstNameLabel,
    placeholder: Strings.firstNameLabel,
    regex: /^[a-zA-Z- .' \\s ]*$/,
    textInputProps: { autoCapitalize: 'words' }
  },
  last_name1: {
    key: 'last_name1',
    dateType: false,
    label: Strings.lastNameLabel,
    placeholder: '',
    regex: /^[a-zA-Z- .' \\s ]*$/,
    textInputProps: { autoCapitalize: 'words' }
  },
  name: {
    key: 'name',
    dateType: false,
    label: Strings.businessNameLabel,
    placeholder: '',
    regex: /^[a-zA-Z- .' \\s ]*$/,
    textInputProps: { autoCapitalize: 'words' }
  },
  fullName: {
    key: 'fullName',
    dateType: false,
    label: 'Full Name',
    placeholder: '',
    onValidationCheck: val =>
      !!val &&
      val.split(' ').length >= 2 &&
      val.split(' ')[1].length > 0 &&
      /^[ a-zA-Z ][a-zA-Z0-9- .'’ \\s ]*$/.test(val),
    textInputProps: { autoCapitalize: 'words', maxLength: 33 }
  },
  email: {
    key: 'email',
    dateType: false,
    label: Strings.emailLabel,
    placeholder: Strings.emailLabel,
    regex:
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    textInputProps: { keyboardType: 'email-address', autoCapitalize: 'none' }
  },
  phone: {
    code: {
      key: 'countrycode',
      label: 'Country Code',
      placeholder: '',
      regex: /^(\+\d{1,4})$/,
      textInputProps: { keyboardType: 'phone-pad' }
    },
    countryCodeRequired: true,
    key: 'phone',
    dateType: false,
    label: Strings.phoneLabel,
    placeholder: '',
    regex: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    phoneNumberValidation: true,
    textInputProps: { keyboardType: 'phone-pad' }
  },
  phone1: {
    code: {
      key: 'countrycode',
      label: 'Country Code',
      placeholder: '',
      regex: /^(\+\d{1,4})$/,
      textInputProps: { keyboardType: 'phone-pad' }
    },
    countryCodeRequired: true,
    key: 'phone1',
    dateType: false,
    label: Strings.phoneLabel,
    placeholder: '',
    regex: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    phoneNumberValidation: true,
    textInputProps: { keyboardType: 'phone-pad' }
  },
  mobile: {
    code: {
      key: 'countrycode',
      label: 'Country Code',
      placeholder: '',
      regex: /^(\+\d{1,4})$/,
      textInputProps: { keyboardType: 'phone-pad' }
    },
    countryCodeRequired: true,
    key: 'mobile',
    dateType: false,
    label: 'Mobile Number e.g. +1-111-222-3333',
    placeholder: '',
    regex: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    phoneNumberValidation: true,
    textInputProps: { keyboardType: 'phone-pad' }
  },
  password: {
    key: 'password',
    dateType: false,
    label: Strings.passwordLabel,
    placeholder: '',
    passwordPolicy: true,
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
    onPasswordValidationCheck: true,
    textInputProps: { autoCapitalize: 'none' }
  },
  signUpCode: {
    key: 'business_code',
    dateType: false,
    label: 'Signup Code',
    placeholder: ''
  },
  date_of_birth: {
    key: 'date_of_birth',
    dateType: true,
    label: Strings.birthdayLabel,
    placeholder: '',
    regex: null
  },
  gender: {
    key: 'gender',
    dateType: false,
    label: 'Gender',
    placeholder: '',
    regex: null,
    items: [
      { label: 'Male', value: 'MALE' },
      { label: 'Female', value: 'FEMALE' }
    ],
    dropdown: true
  },
  address_line_one: {
    key: 'address_line_one',
    dateType: false,
    label: Strings.addressLine1,
    placeholder: '',
    textInputProps: { autoCapitalize: 'none' }
  },
  address_line_two: {
    key: 'address_line_two',
    dateType: false,
    label: Strings.addressLine2,
    placeholder: '',
    textInputProps: { autoCapitalize: 'none' }
  },
  zipcode: {
    key: 'zipcode',
    dateType: false,
    label: 'Zip Code',
    placeholder: '',
    textInputProps: { maxLength: 5 }
  },
  position: {
    key: 'position',
    dateType: false,
    label: Strings.position,
    placeholder: '',
    textInputProps: { autoCapitalize: 'none' }
  },
  role: {
    key: 'role',
    dateType: false,
    label: Strings.role,
    placeholder: '',
    dropdown: true,
    items: [
      { label: 'Role number 1', value: 'Role number 1' },
      { label: 'Role number 2', value: 'Role number 2' }
    ],
    textInputProps: { autoCapitalize: 'none' }
  },
  city: {
    key: 'city',
    dateType: false,
    label: Strings.city,
    placeholder: 'City',
    dropdown: false,
    items: [
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' }
    ],
    textInputProps: { autoCapitalize: 'none' }
  },
  state: {
    key: 'state',
    dateType: false,
    label: 'State',
    placeholder: 'State',
    textInputProps: { autoCapitalize: 'none' }
  },
  country: {
    key: 'country',
    dateType: false,
    label: 'Country',
    placeholder: 'Country',
    textInputProps: { autoCapitalize: 'none' }
  },
  price: {
    key: 'price',
    dateType: false,
    label: Strings.pricePerHr,
    placeholder: Strings.pricePerHr,
    textInputProps: { keyboardType: 'number-pad' }
  },
  pay_frequency: {
    key: 'pay_frequency',
    dateType: false,
    label: 'Pay Frequency',
    placeholder: '',
    dropdown: true,
    items: [
      { label: 'Weekly', value: 'Weekly' },
      { label: 'Every two weeks', value: 'Every two weeks' },
      { label: 'On the 1st and 15th', value: 'On the 1st and 15th' }
    ]
  }
}

let formDetails = {
  signUp: {
    show: ['first_name', 'last_name', 'phone', 'email', 'password']
  },
  signUpEmp: {
    show: [
      'first_name',
      'last_name',
      'phone',
      'email',
      'password',
      'signUpCode'
    ]
  },
  login: {
    show: ['email', 'password'],
    updateFields: {
      password: {
        label: 'Password'
      }
    }
  },
  changePassword: {
    show: ['password'],
    updateFields: {
      password: {
        label: 'New Password'
      }
    }
  },
  feedback: {
    show: ['email'],
    updateFields: {
      email: {
        label: 'Email address'
      }
    }
  },
  profile: {
    show: ['firstName', 'lastName', 'email', 'phone']
  },
  emergencyContact: {
    show: ['first_name1', 'last_name1', 'phone1']
  },
  employeePersonalInfo: {
    show: ['first_name', 'last_name', 'date_of_birth', 'gender']
  },
  businessInfo: {
    show: [
      'name',
      'pay_frequency',
      'first_name',
      'last_name',
      'phone',
      'date_of_birth'
    ]
  },
  businessAddress: {
    show: ['address_line_one', 'address_line_two', 'city', 'state', 'zipcode'],
    updateFields: {
      addressLine1: {
        label: 'Business Address Line 1'
      },
      addressLine2: {
        label: 'Business Address Line 2'
      }
    }
  },
  employeeContact: {
    show: ['email', 'mobile', 'phone']
  },
  employeeAddress: {
    show: ['address_line_one', 'address_line_two', 'city', 'state']
  },
  employeeWorkInfo: {
    show: ['position', 'price']
  },
  cardHolder: {
    show: [
      'firstName',
      'lastName',
      'addressLine1',
      'addressLine2',
      'city',
      'state',
      'country'
    ]
  }
}

export default class Forms {
  static fields(key, updateFields = {}, customFormDetails = null) {
    const form = this.getDetails(key)
    const allFields = form.show.map((k, index) => {
      let nextKey = null
      if (index < form.length - 1) {
        nextKey = this.getFields(form.show[index + 1]).key
      }
      return {
        ...this.getFields(k),
        ...(form.updateFields && form.updateFields[k])
      }
    })
    return allFields
  }
  static getFields(key = null) {
    return key ? fields[key] : fields
  }
  static getDetails(key = null) {
    return key ? formDetails[key] : formDetails
  }
}
