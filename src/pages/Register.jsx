import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";

import { useAuth } from "../context/AuthContext";
import { Button, Field, Input, ErrorBanner } from "../components/ui";
import currencies from "../utils/currencies";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    currency: "GBP",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="flex flex-d text-3xl font-medium text-paper-card">
            Personal Expenditure Tracking system
          </p>
          <p className="mt-1 text-sm text-paper-card/50">
            Create your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-md border border-paper-card/10 bg-ink-light p-6"
        >
          <ErrorBanner message={error} />

          <div className="space-y-4">
            <Field label="Name">
              <Input
                required
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Email">
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Password">
              <Input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Currency">
              <Select
                options={currencies}
                isSearchable
                placeholder="Select your currency"
                value={currencies.find(
                  (currency) => currency.value === form.currency
                )}
                onChange={(selected) =>
                  setForm({
                    ...form,
                    currency: selected.value,
                  })
                }
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "#1E293B",
                    borderColor: "#334155",
                    color: "#fff",
                    minHeight: "42px",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "#1E293B",
                    color: "#fff",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? "#374151"
                      : "#1F2937",
                    color: "#fff",
                    cursor: "pointer",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "#fff",
                  }),
                  input: (base) => ({
                    ...base,
                    color: "#fff",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#94A3B8",
                  }),
                }}
              />
            </Field>
          </div>

          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-paper-card/50">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-gold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}