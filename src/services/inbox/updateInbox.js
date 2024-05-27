import { toast } from 'react-toastify'
import { ayonApi } from '../ayon'
import { current } from '@reduxjs/toolkit'

const updateInbox = ayonApi.injectEndpoints({
  endpoints: (build) => ({
    updateInboxMessage: build.mutation({
      query: ({ status, projectName, ids = [] }) => ({
        url: `/api/inbox`,
        method: 'POST',
        body: { status, projectName, ids },
      }),
      async onQueryStarted(
        { ids, status, active, important, last, isActiveChange },
        { dispatch, queryFulfilled },
      ) {
        let newRead, newActive

        switch (status) {
          case 'read':
            newRead = true
            newActive = true
            break
          case 'unread':
            newRead = false
            newActive = true
            break
          case 'inactive':
            newActive = false
            newRead = true
            break
        }

        let patchResult

        if (isActiveChange) {
          // this means we are changing the active (cleared) status of the message
          // if will be moving from one cache to another

          let messages = []

          //   the cache to remove from (current tab)
          dispatch(
            ayonApi.util.updateQueryData('getInbox', { last, important, active }, (draft) => {
              // find the messages to clear
              messages = draft.messages
                .filter((m) => ids.includes(m.referenceId))
                .map((m) => current(m))
              // filter out the messages to clear
              draft.messages = draft.messages.filter((m) => !ids.includes(m.referenceId))
            }),
          )

          //   for each message to clear/un-clear it
          // we do it in a loop because not all message will have the same important status
          messages.forEach((message = {}) => {
            const messagePatch = { ...message, active: !active }
            // important will always be null when clearing a message
            let isImportant = null
            if (active) {
              // clearing the message
              // read message
              messagePatch.read = true
            } else {
              // un-clearing the message
              isImportant = message.important
              messagePatch.read = status === 'read'
            }

            //   the cache to add to (cleared/important/other tab)
            dispatch(
              ayonApi.util.updateQueryData(
                'getInbox',
                { last, important: isImportant, active: !active },
                (draft) => {
                  // adding message to the new cache
                  console.log('adding message to new cache location')
                  draft.messages.unshift(messagePatch)
                },
              ),
            )
          })
        } else {
          // patch new data into the cache
          patchResult = dispatch(
            ayonApi.util.updateQueryData('getInbox', { last, active, important }, (draft) => {
              for (const id of ids) {
                const messageIndex = draft.messages.findIndex((m) => m.referenceId === id)
                if (messageIndex !== -1) {
                  console.log('updating message')
                  draft.messages[messageIndex] = {
                    ...draft.messages[messageIndex],
                    read: newRead,
                    active: newActive,
                  }
                }
              }
            }),
          )
        }

        try {
          await queryFulfilled
        } catch (error) {
          const message = `Error: ${error?.error?.data?.detail}`
          console.error(message, error)
          toast.error(message)
          patchResult.undo()
        }
      },
    }),
  }),
})

export const { useUpdateInboxMessageMutation } = updateInbox
