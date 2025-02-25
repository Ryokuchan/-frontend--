import React, { FC, useEffect, useState } from 'react';

import { Button, Col, DatePicker, Form, Input, Modal, Row, Select, Spin, Table } from 'antd';
const { Option } = Select

import { SearchPersonDocument, _CreatePersonInput, useCreatePersonMutation, useDeletePersonMutation, useSearchPersonQuery, _UpdatePersonInput, PersonAttributesFragment, useUpdatePersonMutation } from '../../__generate/graphql-frontend'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import ErrorModal from '../basic/ErrorModal';
import Search from 'antd/lib/input/Search';

export const refetchPersonQueries = ["searchPerson"]

enum ShowForm {
    None,
    Create,
    Update
}

type InputParameters = Partial<_UpdatePersonInput>


function mapToInput(data: PersonAttributesFragment | undefined): InputParameters {
    const result = { ...data }
    delete result.__typename
    return result
}

export const PersonList: FC = () => {

    const columns = [
        {
            title: "id (email)",
            key: 'id',
            dataIndex: 'id',
        },
        {
            title: "Last Name",
            key: 'lastName',
            dataIndex: 'lastName',
        },
        {
            title: "First Name",
            key: 'firstName',
            dataIndex: 'firstName',
        },
        {
            title: "Birth Date",
            key: 'birthDate',
            dataIndex: 'birthDate',
        },
        {
            title: "",
            key: 'actions',
            dataIndex: 'actions',
        }
    ]

    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState<ShowForm>(ShowForm.None)
    const [error, setError] = useState<Error | null>(null)

    const [inputParameters, setInputParameters] = useState<InputParameters>({})
    const changeInputParameters = (params: InputParameters) => {
        var input = { ...inputParameters }
        setInputParameters(Object.assign(input, params))
    }

    const [searchStr, setSearchStr] = useState<string>("")

    const { data, loading, error: errorQuery } = useSearchPersonQuery({
        variables: {
            searchStr
        }
    })
    const personList = data?.searchPerson.elems

    const [createPersonMutation, { error: errorCreate, data: dataCreate }] = useCreatePersonMutation()
    const [updatePersonMutation, { error: errorUpdate, data: dataUpdate }] = useUpdatePersonMutation()
    const [deletePersonMutation, { error: errorDelete }] = useDeletePersonMutation()

    useEffect(() => {
        const err = [errorQuery, errorCreate, errorUpdate, errorDelete].find(e => e)
        if (err) {
            setError(err)
        }

    }, [errorQuery, errorCreate, errorUpdate, errorDelete])

    useEffect(() => {
        if (dataCreate || dataUpdate)
            setShowForm(ShowForm.None)
    },
        [dataCreate, dataUpdate]
    )

    const mapToView = (list: typeof personList) => {
        return (
            list?.map(elem => {
                return {
                    key: elem.id ?? "",
                    id: elem.id,
                    lastName: elem.lastName,
                    firstName: elem.firstName,
                    birthDate: elem.birthDate,
                    actions: <>
                        <Button style={{ margin: "5px" }}
                            key={"e" + elem.id}
                            onClick={() => {
                                setInputParameters(mapToInput(elem))
                                setShowForm(ShowForm.Update)
                            }}
                        ><EditOutlined />
                        </Button>
                        <Button style={{ margin: "5px" }}
                            key={"d" + elem.id}
                            onClick={() => { setDeleteId(elem.id) }}
                        ><DeleteOutlined  /></Button>
                    </>
                }
            })
        )
    }

    if (loading) return (<Spin tip="Loading..." />);
    if (error) return (<ErrorModal error={error} setError={setError} />)

    return (
        <>
                    <Modal visible={deleteId != null}
                onCancel={() => setDeleteId(null)}
                onOk={
                    () => {
                        deletePersonMutation({
                            variables: {
                                id: deleteId!
                            },
                            update: (store) => {
                                store.writeQuery({
                                    query: SearchPersonDocument,
                                    variables: { searchStr },
                                    data: {
                                        searchPerson: {
                                            elems: personList!.filter(x => x.id !== deleteId)
                                        }
                                    }
                                })
                            }
                        })
                        setDeleteId(null)
                    }
                }
            >Delete?</Modal>
            <Row>
                <Col span="4">
                    <Button
                        onClick={() => {
                            setInputParameters({})
                            setShowForm(ShowForm.Create)
                        }}>
                        <PlusOutlined  ></PlusOutlined>
                    </Button>
                </Col>
                <Col span="4">
                    <Search  defaultValue={searchStr} onSearch={(value) => setSearchStr(value)} />
                </Col>
            </Row>


            <Modal visible={showForm != ShowForm.None}
                onCancel={() => setShowForm(ShowForm.None)}
                onOk={() => {
                    if (showForm == ShowForm.Create) {
                        createPersonMutation({
                            variables: {
                                input: inputParameters as _CreatePersonInput
                            },
                            update: (store, result) => {
                                store.writeQuery({
                                    query: SearchPersonDocument,
                                    variables: { searchStr },
                                    data: {
                                        searchPerson: {
                                            elems: [, ...personList!, result.data?.packet?.createPerson]
                                        }
                                    }
                                })
                            }
                        })
                    } else if (showForm == ShowForm.Update) {
                        updatePersonMutation({ variables: { input: Object.assign(inputParameters) as _UpdatePersonInput } })
                    }
                }}
            >
                <Form>
                    <Form.Item label="Id(email)">
                        <Input readOnly={showForm == ShowForm.Update}
                            value={inputParameters.id!}
                            onChange={(e: { target: { value: any; }; }) => changeInputParameters({ id: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="LastName">
                        <Input 
                            value={inputParameters.lastName!}
                            onChange={(e: { target: { value: any; }; }) => changeInputParameters({ lastName: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="FirstName">
                        <Input
                            value={inputParameters.firstName!}
                            onChange={(e: { target: { value: any; }; }) => changeInputParameters({ firstName: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="BirthDate">
                        <DatePicker
                            value={inputParameters.birthDate ? moment(inputParameters.birthDate, "YYYY-MM-DD") : null}
                            onChange={moment => changeInputParameters({ birthDate: moment?.format("YYYY-MM-DD") })}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>
                </Form>

            </Modal>
            <Table
                columns={columns}
                dataSource={mapToView(personList)}
            />

        </>

    )
}