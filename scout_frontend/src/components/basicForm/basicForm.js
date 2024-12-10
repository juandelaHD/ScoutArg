import React, { useState } from "react";
import "./basicForm.css";

const BasicForm = ({ fields, onSubmit, onCancel, setFile }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [file, setFileLocal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => {
      acc[field.name] = field.value || "";
      return acc;
    }, {})
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
  
    fields.forEach((field) => {
      if (field.type === "dropdown") {
        const firstOption = field.options.find((option) =>
          option.label.toLowerCase().includes(newSearchQuery.toLowerCase())
        );
      
        setFormData((prevData) => ({
          ...prevData,
          [field.name]: firstOption ? firstOption.value : "",
        }))
      }
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileLocal(selectedFile);
    setFile(selectedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fields.length !== 0) {
      const hasFileField = fields.some((field) => field.name === "foto");

      for (const field of fields) {
        if (field.name === "foto") {
          continue;
        }
        if (field.required && !formData[field.name]) {
          setErrorMessage(`Por favor, completa el campo: ${field.label}`);
          return;
        }
      }

      const allFieldsOptional = fields.every((field) => !field.required);

      if (allFieldsOptional) {
        const isAnyFieldModified = fields.some((field) =>
          field.name === "foto"
            ? hasFileField && file
            : formData[field.name] !== field.value
        );

        if (!isAnyFieldModified) {
          setErrorMessage(
            "Debes modificar al menos un campo para enviar el formulario."
          );
          return;
        }
      }
    }

    setErrorMessage("");
    onSubmit({ ...formData, file });
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {fields.map((field) => (
        <div className="form-group" key={field.name}>
          {field.name === "foto" ? (
            <div className="file-upload">
              <label htmlFor="file-upload" className="custom-file-upload">
                {field.label}
              </label>
              <input
                type="file"
                id="file-upload"
                name="foto"
                onChange={handleFileChange}
                accept="image/*"
              />
              <p>{file ? file.name : "No se ha seleccionado un archivo"}</p>
            </div>
          ) : field.type === "dropdown" ? (
            <>
              <label htmlFor={field.name}>{field.label}</label>
              <input
                type="text"
                id={`${field.name}-search`}
                placeholder="Buscar..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ marginBottom: "1rem" }}
              />
              <div className="dropdown-container">
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  {field.options
                    .filter((option) =>
                      option.label.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <label htmlFor={field.name}>{field.label}</label>
              <input
                type={field.type || "text"}
                id={field.name}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
              />
            </>
          )}
        </div>
      ))}

      {errorMessage && <p className="error">{errorMessage}</p>}

      <div className="button-container-form">
        <button type="submit" className="auth-button">
          Confirmar
        </button>
        {onCancel && typeof onCancel === "function" && (
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default BasicForm;
