import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/react'
import { Provider, createClient } from 'urql';
import theme from '../theme'

const client = createClient({
  url: 'http://localhost:4000/graphql',
});

function MyApp({ Component, pageProps }) {
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <CSSReset />
          <Component {...pageProps} />
        </ColorModeProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default MyApp
