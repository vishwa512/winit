import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { mockTemplates, mockAudits, mockUsers } from '../data/mockData';
import { Template, Audit, User, AuditStatus } from '../types';

interface AuditState {
  templates: Template[];
  audits: Audit[];
  users: User[];
  currentTemplate: Template | null;
  currentAudit: Audit | null;
}

type AuditAction =
  | { type: 'SET_CURRENT_TEMPLATE'; payload: Template | null }
  | { type: 'SET_CURRENT_AUDIT'; payload: Audit | null }
  | { type: 'ADD_TEMPLATE'; payload: Template }
  | { type: 'UPDATE_TEMPLATE'; payload: Template }
  | { type: 'ADD_AUDIT'; payload: Audit }
  | { type: 'UPDATE_AUDIT'; payload: Audit }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'PUBLISH_TEMPLATE'; payload: string };

const initialState: AuditState = {
  templates: mockTemplates,
  audits: mockAudits,
  users: mockUsers,
  currentTemplate: null,
  currentAudit: null,
};

const auditReducer = (state: AuditState, action: AuditAction): AuditState => {
  switch (action.type) {
    case 'SET_CURRENT_TEMPLATE':
      return { ...state, currentTemplate: action.payload };
    case 'SET_CURRENT_AUDIT':
      return { ...state, currentAudit: action.payload };
    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.payload] };
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'ADD_AUDIT':
      return { ...state, audits: [...state.audits, action.payload] };
    case 'UPDATE_AUDIT':
      return {
        ...state,
        audits: state.audits.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(t => t.id !== action.payload),
      };
    case 'PUBLISH_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(t =>
          t.id === action.payload ? { ...t, isPublished: true } : t
        ),
      };
    default:
      return state;
  }
};

const AuditContext = createContext<{
  state: AuditState;
  dispatch: React.Dispatch<AuditAction>;
} | null>(null);

export const AuditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(auditReducer, initialState);

  return (
    <AuditContext.Provider value={{ state, dispatch }}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};