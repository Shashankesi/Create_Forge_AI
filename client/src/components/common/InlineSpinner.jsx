import React from 'react';
import { CreateForgeMark } from '../brand/CreateForgeMark';

export const InlineSpinner = ({ size = 16, className = '' }) => {
  return <CreateForgeMark size={size} animate={true} className={className} />;
};

