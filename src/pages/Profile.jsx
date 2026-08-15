import {
  useEffect,
  useState,
} from 'react';

import {
  User,
  Mail,
  Banknote,
  Save,
} from 'lucide-react';

import currencies from '../utils/currencies';

import ReactSelect from 'react-select';

import {
  Button,
  Card,
  Field,
  Input,
  ErrorBanner,
} from '../components/ui';

import { useAuth } from '../context/AuthContext';

import { usersApi } from '../api';


export default function Profile() {

  const {
    user,
    updateUser,
    refreshUser
  } = useAuth();


  /* =========================================================
     FORM
  ========================================================= */

  const [form, setForm] = useState({
    name: '',
    email: '',
    currency: 'GBP',
  });


  /* =========================================================
     STATE
  ========================================================= */

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');


  /* =========================================================
     LOAD USER INTO FORM
  ========================================================= */

  useEffect(() => {

    if (!user) return;


    setForm({
      name: user.name || '',
      email: user.email || '',
      currency:
        user.currency || 'GBP',
    });

  }, [user]);


  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  /* =========================================================
     UPDATE PROFILE
  ========================================================= */

  const handleSubmit = async (e) => {

    e.preventDefault();


    setError('');
    setSuccess('');


    /* NAME VALIDATION */

    if (!form.name.trim()) {

      setError(
        'Name is required.'
      );

      return;
    }


    /* EMAIL VALIDATION */

    if (!form.email.trim()) {

      setError(
        'Email address is required.'
      );

      return;
    }


    setSaving(true);


    try {

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        currency: form.currency,
      };


      /*
        Update backend
      */
      console.log(user?._id,
          payload)
      const response =
        await usersApi.updateProfile(user?._id,
          payload
        );


      /*
        Depending on your API response,
        this may be response.data.user
        or response.data
      */

      const updatedUser =
        response?.data?.user ||
        response?.data;


      /*
        Update AuthContext + localStorage
      */

      if (
        updateUser &&
        updatedUser
      ) {

        updateUser(
          updatedUser
        );

      }
       await refreshUser(user?._id);

      setSuccess(
        response?.message ||
        response?.data?.message ||
        'Profile updated successfully.'
      );


    } catch (err) {

      console.error(
        'Update profile error:',
        err
      );


      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to update your profile.'
      );


    } finally {

      setSaving(false);

    }

  };


  return (

    <div>


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-6">

        <h1 className="font-display text-2xl text-text-ink">
          My Profile
        </h1>


        <p className="mt-1 text-sm text-text-muted">
          Manage your personal information and preferred currency.
        </p>

      </div>


      {/* =====================================================
          PROFILE INFORMATION
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">


        {/* ===================================================
            LEFT SIDE PROFILE CARD
        =================================================== */}

        <Card>

          <div className="flex flex-col items-center py-4 text-center">


            {/* AVATAR */}

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-brand">

              <User size={34} />

            </div>


            {/* NAME */}

            <h2 className="mt-4 font-display text-xl text-text-ink">

              {user?.name ||
                'User'}

            </h2>


            {/* EMAIL */}

            <p className="mt-1 text-sm text-text-muted">

              {user?.email}

            </p>


            {/* CURRENCY */}

            <div className="mt-4 rounded-full bg-paper px-3 py-1 text-xs text-text-muted">

              Currency:{' '}

              <span className="font-medium text-text-ink">
                {user?.currency ||
                  'GBP'}
              </span>

            </div>

          </div>

        </Card>


        {/* ===================================================
            EDIT PROFILE CARD
        =================================================== */}

        <Card className="lg:col-span-2">


          <div className="mb-5">

            <h2 className="font-display text-lg text-text-ink">
              Personal information
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Update your name, email address and base currency.
            </p>

          </div>


          {/* ERROR */}

          <ErrorBanner
            message={error}
          />


          {/* SUCCESS */}

          {success && (

            <div className="mb-4 rounded-md border border-income/30 bg-income/10 px-4 py-3 text-sm text-income">

              {success}

            </div>

          )}


          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >


            {/* NAME */}

            <Field label="Name">

              <div className="relative">

                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
                />

                <Input
                  name="name"
                  required
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  placeholder="Your name"
                  className="pl-10"
                />

              </div>

            </Field>


            {/* EMAIL */}

            <Field label="Email">

              <div className="relative">

                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
                />

                <Input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={
                    handleChange
                  }
                  placeholder="you@example.com"
                  className="pl-10"
                />

              </div>

            </Field>


            {/* =================================================
                CURRENCY
            ================================================= */}

            <Field label="Base Currency">

              <div className="relative">

                <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">

                  <Banknote
                    size={14}
                  />

                  Currency used for your dashboard, reports and financial values.

                </div>


                <ReactSelect

                  options={currencies}

                  isSearchable

                  placeholder="Select your preferred currency"

                  value={
                    currencies.find(
                      (currency) =>
                        currency.value ===
                        form.currency
                    ) || null
                  }

                  onChange={(
                    selected
                  ) =>

                    setForm(
                      (previous) => ({
                        ...previous,

                        currency:
                          selected?.value ||
                          'GBP',
                      })
                    )

                  }

                  styles={{

                    control: (
                      base,
                      state
                    ) => ({
                      ...base,

                      minHeight:
                        '42px',

                      borderRadius:
                        '0.25rem',

                      backgroundColor:
                        'transparent',

                      borderColor:
                        state.isFocused
                          ? '#4F46E5'
                          : '#D1D5DB',

                      boxShadow:
                        'none',

                      '&:hover': {
                        borderColor:
                          '#4F46E5',
                      },

                    }),


                    menu: (
                      base
                    ) => ({
                      ...base,

                      zIndex: 50,
                    }),


                    singleValue: (
                      base
                    ) => ({
                      ...base,

                      color:
                        'inherit',
                    }),

                  }}
                />

              </div>

            </Field>


            {/* =================================================
                BUTTON
            ================================================= */}

            <div className="flex justify-end border-t border-line pt-5">

              <Button
                type="submit"
                disabled={saving}
              >

                <Save
                  size={16}
                />

                {saving
                  ? 'Saving…'
                  : 'Save changes'}

              </Button>

            </div>

          </form>

        </Card>

      </div>

    </div>
  );
}