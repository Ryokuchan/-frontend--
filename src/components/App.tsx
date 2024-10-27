import React, { FC, useEffect, useState } from 'react';
import 'antd/dist/antd.css';
import dayjs from 'dayjs';
import ru_RU from 'antd/lib/locale/ru_RU'

import { ApolloClient, ApolloProvider, NormalizedCacheObject } from '@apollo/client';

import { cache } from '../cache'

import { AppContext, UserInfo } from './AppContext'
import Keycloak, { KeycloakInstance } from 'keycloak-js';

import { Button, Col, ConfigProvider, Row, Spin } from "antd";
import Layout, { Content, Header } from 'antd/lib/layout/layout';
import { LogoutOutlined } from "@ant-design/icons"
import { AppTabs } from './AppTabs';

export const App: FC = () => {
  const [keycloak, setKeycloak] = useState<KeycloakInstance>(Keycloak('/keycloak.json'))
  const [authenticated, setAuthenticated] = useState<boolean>(false)
  const [userInfo, setUserInfo] = useState<UserInfo>()
  const [apolloClient, setAppoloClient] = useState<ApolloClient<NormalizedCacheObject>>()

  const initEnv = async () => {
    console.log("init env start")
    const res = await fetch("/env.json")
    console.log("after fetch")
    const json = JSON.parse(await res.text())
    console.log("after parse")
    console.log(json)
    process.env.DS_ENDPOINT = json.DS_ENDPOINT

  }

  const initClient = async (keycloak: Keycloak.KeycloakInstance) => {

    if (process.env.NODE_ENV === 'production')
      await initEnv()
    if (!apolloClient) {
      return new ApolloClient({
        cache: cache,
        uri: process.env.NODE_ENV === 'production' ? process.env.DS_ENDPOINT : '/graphql',
        headers: {
          "Authorization": "Bearer " + keycloak.token
        }
      })
    }
  }



  useEffect(() => {
    const appoloClientInit = async (keycloak: Keycloak.KeycloakInstance) => {
      const apolloClient = await initClient(keycloak)

      setAppoloClient(apolloClient)
    }


    keycloak.init({ onLoad: 'login-required' }).then(async auth => {
      setKeycloak(keycloak)
      setAuthenticated(auth)

      await appoloClientInit(keycloak)

      if (!userInfo) {
        keycloak.loadUserInfo().then(value => {
          setUserInfo(Object.assign(value, keycloak?.resourceAccess![keycloak.clientId!]) as UserInfo)
        })
      }
    })

  }, [])


  console.log("process.env.DS_ENDPOINT:" + process.env.DS_ENDPOINT)

  if (authenticated && userInfo && apolloClient) {

    return (
      <AppContext.Provider value={{ keycloak: keycloak, userInfo: userInfo }}>
        <ApolloProvider client={apolloClient!}>
          <ConfigProvider locale={ru_RU}>
            <Layout>
              <Header>
                <Row>
                  <Col span={22}>
                  </Col>
                  <Col span={2}>
                    <Button onClick={() => keycloak.logout()}>
                      <LogoutOutlined />
                    </Button>
                  </Col>
                </Row>
              </Header>
              <Content>
                <AppTabs />
              </Content>
            </Layout>
          </ConfigProvider>
        </ApolloProvider>
      </AppContext.Provider>
    )

  }
  return (
    <Spin style={{
      margin: 0,
      position: "absolute",
      top: "45%",
      left: "45%"
    }} tip="...Authentication process..." size={"large"} />
  )
}