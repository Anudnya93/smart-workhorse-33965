import { Colors, Images, Strings } from '../../res'

const fields = {
  worksiteName: {
    key: 'name',
    dateType: false,
    label: Strings.worksiteName,
    placeholder: Strings.firstNameLabel,
    regex: /^[a-zA-Z- .' \\s ]*$/,
    textInputProps: { autoCapitalize: 'words' }
  },
  worksiteLocation: {
    key: 'location',
    dateType: false,
    label: Strings.worksiteLocation,
    placeholder: '',
    regex: /^[a-zA-Z- .' \\s ]*$/,
    textInputProps: { autoCapitalize: 'words' }
  },
  address_line_two: {
    key: 'address_line_two',
    dateType: false,
    label: Strings.addressLine2,
    placeholder: '',
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
  zipcode: {
    key: 'zipcode',
    dateType: false,
    label: 'Zip Code',
    placeholder: '',
    textInputProps: { maxLength: 5, keyboardType: 'number-pad' }
  },
  description: {
    key: 'description',
    dateType: false,
    label: Strings.description,
    placeholder: Strings.description
  },
  monthlyRate: {
    key: 'monthly_rates',
    dateType: false,
    label: Strings.monthlyRate + ' $',
    placeholder: Strings.monthlyRate + ' $',
    textInputProps: { keyboardType: 'phone-pad' }
  },
  notes: {
    key: 'notes',
    dateType: false,
    label: Strings.notes,
    placeholder: Strings.notes
  },
  cleaningFreq: {
    key: 'clear_frequency_by_day',
    dateType: false,
    label: Strings.cleaningFreq,
    placeholder: '',
    dropdown: true,
    items: [
      { label: 'Sunday', value: 'SUNDAY' },
      { label: 'Monday', value: 'MONDAY' },
      { label: 'Tuesday', value: 'TUESDAY' },
      { label: 'Wednesday', value: 'WEDNESDAY' },
      { label: 'Thursday', value: 'THURSDAY' },
      { label: 'Friday', value: 'FRIDAY' },
      { label: 'Saturday', value: 'SATURDAY' }
    ]
  },
  desiredTime: {
    key: 'desired_time',
    label: Strings.desiredTime,
    dateType: false,
    placeholder: '',
    textInputProps: {}
  },
  numWorkers: {
    key: 'number_of_workers_needed',
    label: Strings.numWorkers,
    placeholder: '',
    regex: null,
    textInputProps: { keyboardType: 'phone-pad' }
  },
  supplies: {
    key: 'supplies_needed',
    dateType: false,
    label: Strings.supplies,
    placeholder: '',
    regex: null,
    textInputProps: { keyboardType: 'default' }
  },
  upload_instruction_video_link: {
    key: 'upload_instruction_video_link',
    dateType: false,
    label: 'Upload Instruction Video Link',
    placeholder: '',
    regex: null,
    textInputProps: { keyboardType: 'default' }
  },
  taskName: {
    key: 'name',
    dateType: false,
    label: Strings.taskName,
    placeholder: Strings.taskName,
    regex: /^[a-zA-Z- .' \\s ]*$/,
    textInputProps: { autoCapitalize: 'words' }
  },
  criticality: {
    key: 'criticality',
    dateType: false,
    label: Strings.criticality,
    placeholder: Strings.criticality,
    dropdown: true,
    items: [
      { label: 'LOW', value: 'LOW' },
      { label: 'MEDIUM', value: 'MEDIUM' },
      { label: 'HIGH', value: 'HIGH' }
    ]
  },
  taskFreq: {
    key: 'frequency_of_task',
    dateType: false,
    label: Strings.taskFreq,
    placeholder: Strings.taskFreq,
    dropdown: true,
    items: [
      { label: 'EVERY TIME', value: 'EVERY_TIME' },
      { label: 'WEEKLY', value: 'WEEKLY' },
      { label: 'SEMI WEEKLY', value: 'SEMI_WEEKLY' },
      { label: 'MONTHLY', value: 'MONTHLY' },
      { label: 'QUARTERLY', value: 'QUARTERLY' },
      { label: 'SEMI ANNUALLY', value: 'SEMI_ANNUALLY' }
    ]
  },
  contactName: {
    key: 'contact_person_name',
    dateType: false,
    label: Strings.name,
    placeholder: Strings.name,
    regex: /^[a-zA-Z- .' \\s ]*$/,
    textInputProps: { autoCapitalize: 'words' }
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
    key: 'contact_phone_number',
    dateType: false,
    label: Strings.phoneLabel,
    placeholder: '',
    regex: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    phoneNumberValidation: true,
    textInputProps: { keyboardType: 'phone-pad' }
  }
}

let formDetails = {
  addWorksite: {
    show: [
      'worksiteName',
      'worksiteLocation',
      'address_line_two',
      'city',
      'state',
      'zipcode',
      'description',
      'notes',
      'monthlyRate',
      'cleaningFreq',
      'desiredTime',
      'numWorkers',
      'supplies',
      'upload_instruction_video_link'
    ]
  },
  worksiteContact: {
    show: ['contactName', 'phone']
  },
  addTask: {
    show: ['taskName', 'description', 'notes', 'criticality', 'taskFreq']
  }
}

export default class WorksiteForms {
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
