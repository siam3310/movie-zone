import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return <div className="p-4 text-red-500 text-center">{message}</div>;
};

export default ErrorMessage;
