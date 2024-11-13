import {json, redirect} from '@shopify/remix-oxygen';
import {
  useActionData,
  Form,
  useOutletContext,
  useNavigation,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {Button} from '~/components/Button';
import {Text} from '~/components/Text';
import {getInputStyleClasses} from '~/lib/utils';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';

import {doLogout} from './($locale).account_.logout';

/**
 * @param {FormData} formData
 * @param {string} key
 */
const formDataHas = (formData, key) => {
  if (!formData.has(key)) return false;

  const value = formData.get(key);
  return typeof value === 'string' && value.length > 0;
};

export const handle = {
  renderInModal: true,
};

/**
 * @type {ActionFunction}
 */
export const action = async ({request, context, params}) => {
  const formData = await request.formData();

  // Double-check current user is logged in.
  // Will throw a logout redirect if not.
  if (!(await context.customerAccount.isLoggedIn())) {
    throw await doLogout(context);
  }

  try {
    const customer = {};

    formDataHas(formData, 'firstName') &&
      (customer.firstName = formData.get('firstName'));
    formDataHas(formData, 'lastName') &&
      (customer.lastName = formData.get('lastName'));

    const {data, errors} = await context.customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
        },
      },
    );

    invariant(!errors?.length, errors?.[0]?.message);

    invariant(
      !data?.customerUpdate?.userErrors?.length,
      data?.customerUpdate?.userErrors?.[0]?.message,
    );

    return redirect(params?.locale ? `${params.locale}/account` : '/account');
  } catch (error) {
    return json(
      {formError: error?.message},
      {
        status: 400,
      },
    );
  }
};

/**
 * Since this component is nested in `accounts/`, it is rendered in a modal via `<Outlet>` in `account.tsx`.
 *
 * This allows us to:
 * - preserve URL state (`/accounts/edit` when the modal is open)
 * - co-locate the edit action with the edit form (rather than grouped in account.tsx)
 * - use the `useOutletContext` hook to access the customer data from the parent route (no additional data loading)
 * - return a simple `redirect()` from this action to close the modal :mindblown: (no useState/useEffect)
 * - use the presence of outlet data (in `account.tsx`) to open/close the modal (no useState)
 */
export default function AccountDetailsEdit() {
  const actionData = useActionData();
  const {customer} = useOutletContext();
  const {state} = useNavigation();

  return (
    <>
      <Text className="mt-4 mb-6" as="h3" size="lead">
        Update your profile
      </Text>
      <Form method="post">
        {actionData?.formError && (
          <div className="flex items-center justify-center mb-6 bg-red-100 rounded">
            <p className="m-4 text-sm text-red-900">{actionData.formError}</p>
          </div>
        )}
        <div className="mt-3">
          <input
            className={getInputStyleClasses()}
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            aria-label="First name"
            defaultValue={customer.firstName ?? ''}
          />
        </div>
        <div className="mt-3">
          <input
            className={getInputStyleClasses()}
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            aria-label="Last name"
            defaultValue={customer.lastName ?? ''}
          />
        </div>
        <div className="mt-6">
          <Button
            className="text-sm mb-2"
            variant="primary"
            width="full"
            type="submit"
            disabled={state !== 'idle'}
          >
            {state !== 'idle' ? 'Saving' : 'Save'}
          </Button>
        </div>
        <div className="mb-4">
          <Button to=".." className="text-sm" variant="secondary" width="full">
            Cancel
          </Button>
        </div>
      </Form>
    </>
  );
}

/**
 * @typedef {Object} AccountOutletContext
 * @property {Customer} customer
 */
/**
 * @typedef {Object} ActionData
 * @property {boolean} [success]
 * @property {string} [formError]
 * @property {Object} [fieldErrors]
 * @property {string} [fieldErrors.firstName]
 * @property {string} [fieldErrors.lastName]
 * @property {string} [fieldErrors.email]
 * @property {string} [fieldErrors.phone]
 * @property {string} [fieldErrors.currentPassword]
 * @property {string} [fieldErrors.newPassword]
 * @property {string} [fieldErrors.newPassword2]
 */

/** @typedef {import('@shopify/remix-oxygen').ActionFunction} ActionFunction */
/** @typedef {import('@shopify/hydrogen/customer-account-api-types').Customer} Customer */
/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerUpdateInput} CustomerUpdateInput */
