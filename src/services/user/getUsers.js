import { ayonApi } from '../ayon'
import ayonClient from '/src/ayon'

const USERS_LIST_QUERY = `
query UserList {
  users {
    edges {
      node {
        name
      }
    }
  }
}
`

const USER_BY_NAME_QUERY = `
  query UserList($name:String!) {
    users(name: $name) {
      edges {
        node {
          name
          isAdmin
          isManager
          isService
          isGuest
          active
          roles
          defaultRoles
          hasPassword
          attrib {
            #ATTRS#
          }
        }
      }
    }
  }
`
const USERS_QUERY = `
  query UserList {
    users {
      edges {
        node {
          name
          isAdmin
          isManager
          isService
          isGuest
          active
          roles
          defaultRoles
          hasPassword
          createdAt
          updatedAt
          apiKeyPreview
          attrib {
            #ATTRS#
          }
        }
      }
    }
  }
`

const buildUsersQuery = (QUERY) => {
  let f_attribs = ''
  for (const attrib of ayonClient.settings.attributes) {
    if (attrib.scope.includes('user')) f_attribs += `${attrib.name}\n`
  }

  if (!QUERY) return null

  return QUERY.replace('#ATTRS#', f_attribs)
}

const getUsers = ayonApi.injectEndpoints({
  endpoints: (build) => ({
    getUsersList: build.query({
      query: () => ({
        url: '/graphql',
        method: 'POST',
        body: {
          query: USERS_LIST_QUERY,
          variables: {},
        },
      }),
      transformResponse: (res) => res?.data?.users.edges.map((e) => e.node),
      providesTags: () => ['user'],
    }),
    getUsers: build.query({
      query: () => ({
        url: '/graphql',
        method: 'POST',
        body: {
          query: buildUsersQuery(USERS_QUERY),
          variables: {},
        },
      }),
      transformResponse: (res, meta, { selfName }) =>
        res?.data?.users.edges.map((e) => ({
          ...e.node,
          self: e.node.name === selfName,
          roles: e.node.roles ? JSON.parse(e.node.roles) : {},
        })),
      providesTags: (res) =>
        res?.data?.users
          ? [...res.data.users.edges.map((e) => ({ type: 'user', name: e.name }))]
          : ['user'],
    }),
    getUser: build.query({
      query: ({ name }) => ({
        url: `/api/users/${name}`,
      }),
      providesTags: (res, g, { name }) => [{ type: 'user', id: name }],
    }),
    getUserByName: build.query({
      query: ({ name }) => ({
        url: '/graphql',
        method: 'POST',
        body: {
          query: buildUsersQuery(USER_BY_NAME_QUERY),
          variables: { name },
        },
      }),
      transformResponse: (res) => res?.data?.users.edges.map((e) => e.node),
      providesTags: (res) =>
        res?.data?.users
          ? [...res.data.users.edges.map((e) => ({ type: 'user', name: e.name }))]
          : ['user'],
    }),
  }),
})

export const { useGetUsersQuery, useGetUsersListQuery, useGetUserByNameQuery, useGetUserQuery } =
  getUsers