import { useState } from 'react';

export default function FormWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    country: ''
  });

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    alert(JSON.stringify(formData, null, 2));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Form Wizard</h2>

      {/* Stepper */}
      <div className="flex justify-between mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex flex-col items-center relative">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${
                step >= s ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`absolute top-3 left-1/2 w-full h-1 ${
                  step > s ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                style={{ zIndex: -1 }}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1 */}
        {step === 1 && (
          <div>
            <label className="block mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />

            <label className="block mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />

            <label className="block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <label className="block mb-2">Street</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />

            <label className="block mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <label className="block mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />
          </div>
        )}

        <div className="flex justify-between mt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Previous
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto px-4 py-2 bg-blue-500 text-white rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="ml-auto px-4 py-2 bg-green-500 text-white rounded"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
