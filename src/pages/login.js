import { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

import axios from 'axios'

import { InputText, Password, Button } from '../components'

import OAuth2ProviderIcon from '../components/oauth2-provider-icon'

const constructOAuth2Url = (url, clientId, redirectUri, scope) => {
  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
    response_type: 'code',
  })
  return `${url}?${query}`
}

const OAuth2Links = ({ options }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 12,
        fontSize: '1.8em',
      }}
    >
      {options.map(({ name, url }) => (
        <a href={url} key={name} title={name}>
          <OAuth2ProviderIcon name={name} />
        </a>
      ))}
    </div>
  )
}

const LoginPage = () => {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const loginRef = useRef(null)
  const passwordRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [oauthOptions, setOauthOptions] = useState([])

  // OAuth2 handler

  useEffect(() => {
    if (window.location.pathname.startsWith('/login/')) {
      // const error = new URLSearchParams(window.location.search).get('error')
      const provider = window.location.pathname.split('/')[2]
      const code = new URLSearchParams(window.location.search).get('code')
      window.history.replaceState({}, document.title, '/')

      if (!(provider && code)) return

      setLoading(true)
      axios
        .get(`/api/oauth2/login/${provider}`, {
          params: {
            code: code,
            redirect_uri: `${window.location.origin}/login/${provider}`,
          },
        })
        .then((response) => {
          const data = response.data

          if (data.user) {
            // login successful
            toast.info(data.detail)
            dispatch({
              type: 'LOGIN',
              user: data.user,
              accessToken: data.token,
            })
          } else {
            toast.error('Unable to login using OAUTH')
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Login form

  const doLogin = () => {
    axios
      .post('/api/auth/login', { name, password })
      .then((response) => {
        if (response.data.user) {
          toast.info(response.data.detail)
          dispatch({
            type: 'LOGIN',
            user: response.data.user,
            accessToken: response.data.token,
          })
        }
      })
      .catch((err) => {
        toast.error(
          err.response.data.detail ||
            `Unable to login: Error ${err.response.status}`
        )
      })
  }

  const onLoginKeyDown = (event) => {
    if (event.key === 'Enter') {
      doLogin()
    }
  }

  useEffect(() => {
    if (loginRef.current) loginRef.current.focus()
  }, [loginRef])

  useEffect(() => {
    let result = []
    axios.get('/api/oauth2/options').then((response) => {
      if (
        !(
          response.data &&
          response.data.options &&
          response.data.options.length
        )
      )
        return

      for (const option of response.data.options) {
        const redirectUri = `${window.location.origin}/login/${option.name}`
        result.push({
          name: option.name,
          url: constructOAuth2Url(
            option.url,
            option.client_id,
            redirectUri,
            option.scope
          ),
        })
      }
      setOauthOptions(result)
    })
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <main className="center" style={{ flexDirection: 'column' }}>
      <h1>OpenPype server</h1>
      <section>
        <InputText
          ref={loginRef}
          placeholder="Username"
          aria-label="Username"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onLoginKeyDown}
        />
        <Password
          ref={passwordRef}
          placeholder="Password"
          feedback={false}
          aria-label="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onLoginKeyDown}
        />
        <Button label="Login" onClick={doLogin} />
      </section>
      {oauthOptions && <OAuth2Links options={oauthOptions} />}
    </main>
  )
}

export default LoginPage
