import React from 'react';

const FormField = ({ label, children }) => {
  return (
    <label className="block mb-3">
      {label && <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>}
      {children}
    </label>
  );
};

export default FormField;
