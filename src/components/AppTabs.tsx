import React, { FC } from 'react';
import { Tabs } from 'antd';
import { PersonList, refetchPersonQueries } from './person/PersonList';
import { DoctorTypeList } from './refs/DoctorTypeList';
import { useAppContext } from './AppContext';
import { useApolloClient } from '@apollo/client';

const { TabPane } = Tabs;

export const AppTabs: FC = () => {
  const roles = useAppContext().userInfo?.roles

  const client = useApolloClient()

  return (
    <Tabs>
          <TabPane key="persons" tab="Persons">
            <PersonList />
          </TabPane>
          <TabPane key="jobType" tab="JobType">
            <DoctorTypeList />
          </TabPane>
    </Tabs>
  );
};