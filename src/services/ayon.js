// Need to use the React-specific entry point to allow generating React hooks
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Util function
export const buildOperations = (ids, type, data) =>
  ids.map((id) => ({
    type: 'update',
    entityType: type,
    entityId: id,
    data,
  }))

const baseQuery = fetchBaseQuery({
  prepareHeaders: (headers) => {
    const storedAccessToken = localStorage.getItem('accessToken')
    if (storedAccessToken) {
      // headers.common['Authorization'] = `Bearer ${storedAccessToken}`
      headers.set('Authorization', `Bearer ${storedAccessToken}`)
    }
    //   headers.common['X-Sender'] = short.generate()
    headers.set('X-Sender', window.senderId)

    return headers
  },
})

// check for 401 and redirect to login
const wrappedBaseQuery = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    window.location.href = '/login'
  }
  return result
}

// Define a service using a base URL and expected endpoints
export const ayonApi = createApi({
  reducerPath: 'ayonApi',
  baseQuery: wrappedBaseQuery,
  tagTypes: [
    'folder',
    'task',
    'version',
    'product',
    'tag',
    'project',
    'projects',
    'attribute',
    'user',
    'workfile',
    'anatomyPresets',
    'hierarchy',
    'branch',
    'entity',
    'login',
    'session',
    'team',
    'info',
    'bundleList',
    'addonSettingsList',
    'addonSettingsSchema',
    'addonSettings',
    'addonSettingsOverrides',
    'customRoots',
    'dependencyPackageList',
    'installerList',
    'secrets',
    'siteSettingsSchema',
    'siteSettings',
    'connections',
    'addonList',
    'projectAddons',
    'settingsAddons',
    'anatomyPresets',
    'accessGroups',
    'accessGroup',
  ],
  endpoints: () => ({}),
})
