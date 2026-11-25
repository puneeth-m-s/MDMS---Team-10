import { createContext } from 'react'
import type { UserRole } from '../types'

export const ServiceFeatureContext = createContext<UserRole>('end-user')
