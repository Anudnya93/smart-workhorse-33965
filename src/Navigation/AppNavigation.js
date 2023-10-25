import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import {
  LoginScene,
  SplashScene,
  ChooseEnvScene,
  RegistrationScene,
  ForgotPasswordScene,
  PrivacyPolicyScene,
  TermsPrivacyScene,
  TokenScene,
  ProfileScene,
  BusinessProfileScene,
  AllSubscriptionScene,
  AddEmployeeScene,
  WorksiteDetailScene,
  AddWorksiteScene,
  CreateTaskScene,
  ChangePassword,
  FeedbackScene,
  CardDetailScene,
  PaymentScene,
  NewMessageScene,
  ResetPasswordScene,
  SignupComplete,
  EmployeesView,
  MessageChat,
  GroupMessageChat,
  GroupMessageScene,
  VerifyAccount,
  AddEvents,
  BusinessProfileView,
  EmployeeProfileScene,
  EmpProfileView,
  InspectionDetails
} from '../UI'
import { drawerNavigator } from './DrawerNavigation'
import { drawerNavigatorEmp } from './DrawerNavigationEmp'
import { TabBar } from './TabBar'
import AuthLoading from '../UI/AuthLoading'
import Notifications from '../UI/Notifications'
import ShiftDetails from '../UI/Home/ShiftDetails'
const Stack = createStackNavigator()

export const AuthNavigator = props => {
  return (
    <Stack.Navigator
      screenOptions={{ gestureEnabled: false }}
      headerMode="none"
    >
      <Stack.Screen name={'AuthLoading'} component={AuthLoading} />
      <Stack.Screen name={'chooseEnv'} component={ChooseEnvScene} />

      <Stack.Screen name={'registration'} component={RegistrationScene} />
      <Stack.Screen name={'signupComplete'} component={SignupComplete} />
      <Stack.Screen name={'VerifyAccount'} component={VerifyAccount} />
      <Stack.Screen name={'login'} component={LoginScene} />
      <Stack.Screen name={'tokenScene'} component={TokenScene} />
      <Stack.Screen name={'forgotPwd'} component={ForgotPasswordScene} />
      <Stack.Screen name={'resetPwd'} component={ResetPasswordScene} />
      <Stack.Screen name={'privacyPolicy'} component={PrivacyPolicyScene} />
      <Stack.Screen name={'termsPrivacy'} component={TermsPrivacyScene} />
      <Stack.Screen name={'profileCreation'} component={ProfileScene} />
      <Stack.Screen
        name={'businessProfileCreation'}
        component={BusinessProfileScene}
      />
      <Stack.Screen name={'tab'} component={TabBar} />

      <Stack.Screen name={'home'} component={drawerNavigator} />
      <Stack.Screen name={'Notifications'} component={Notifications} />
      <Stack.Screen name={'ShiftDetails'} component={ShiftDetails} />
      <Stack.Screen name={'homeEmployee'} component={drawerNavigatorEmp} />
      <Stack.Screen name={'allSubscription'} component={AllSubscriptionScene} />
      <Stack.Screen name={'employeesView'} component={EmployeesView} />
      <Stack.Screen
        name={'BusinessProfileView'}
        component={BusinessProfileView}
      />
      <Stack.Screen
        name={'EmployeeProfileScene'}
        component={EmployeeProfileScene}
      />
      <Stack.Screen name={'EmpProfileView'} component={EmpProfileView} />
      <Stack.Screen name={'addEmployee'} component={AddEmployeeScene} />
      <Stack.Screen name={'worksiteDetail'} component={WorksiteDetailScene} />
      <Stack.Screen name={'addWorksite'} component={AddWorksiteScene} />
      <Stack.Screen name={'createTask'} component={CreateTaskScene} />
      <Stack.Screen name={'addEvents'} component={AddEvents} />
      <Stack.Screen name={'MessageChat'} component={MessageChat} />
      <Stack.Screen name={'GroupMessageChat'} component={GroupMessageChat} />
      <Stack.Screen name={'GroupMessageScene'} component={GroupMessageScene} />

      {/* Settings Screens */}
      <Stack.Screen name={'changePassword'} component={ChangePassword} />
      <Stack.Screen name={'feedbackScene'} component={FeedbackScene} />
      <Stack.Screen name={'paymentScene'} component={PaymentScene} />
      <Stack.Screen name={'cardDetail'} component={CardDetailScene} />
      <Stack.Screen name={'newMessage'} component={NewMessageScene} />
      <Stack.Screen name={'InspectionDetails'} component={InspectionDetails} />
    </Stack.Navigator>
  )
}
