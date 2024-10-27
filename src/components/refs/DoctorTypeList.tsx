import React, { FC, useEffect, useState } from 'react';

import { Button, Col, Form, Input, Modal, Row, Select, Spin, Table } from 'antd';
const { Option } = Select

import { SearchDoctorTypeDocument, _CreateDoctorTypeInput, useUpdateOrCreateDoctorTypeMutation, useDeleteDoctorTypeMutation, useSearchDoctorTypeQuery, DoctorTypeAttributesFragment } from '../../__generate/graphql-frontend'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import ErrorModal from '../basic/ErrorModal';
import Search from 'antd/lib/input/Search';

enum ShowForm {
    None,
    Create,
    Update
}

type InputParameters = Partial<_CreateDoctorTypeInput>
const inputParametersDefault: InputParameters = {isDel: false}


function mapToInput(data: DoctorTypeAttributesFragment | undefined): InputParameters {
    const result = { ...data }
    delete result.__typename
    return result
}

export const DoctorTypeList: FC = () => {

    const columns = [
        {
            title: "Code",
            key: 'id',
            dataIndex: 'id',
        },
        {
            title: "Name",
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: "BasicSum",
            key: 'basicSum',
            dataIndex: 'basicSum',
        },
        {
            title: "IsUnplanned",
            key: 'isUnplanned',
            dataIndex: 'isUnplanned',
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

    const [inputParameters, setInputParameters] = useState<InputParameters>(inputParametersDefault)
    const changeInputParameters = (params: InputParameters) => {
        var input = { ...inputParameters }
        setInputParameters(Object.assign(input, params))
    }

    const [searchStr, setSearchStr] = useState<string>("")

    const { data, loading, error: errorQuery } = useSearchDoctorTypeQuery({
        variables: {
            searchStr
        }
    })
    const doctortypeList = data?.searchDoctorType.elems

    const [createDoctorTypeMutation, { error: errorCreate, data: dataCreate }] = useUpdateOrCreateDoctorTypeMutation()
    const [updateDoctorTypeMutation, { error: errorUpdate, data: dataUpdate }] = useUpdateOrCreateDoctorTypeMutation()
    const [deleteDoctorTypeMutation, { error: errorDelete }] = useDeleteDoctorTypeMutation()

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

    const mapToView = (list: typeof doctortypeList) => {
        return (
            list?.map(elem => {
                return {
                    key: elem.id ?? "",
                    id: elem.id,
                    name: elem.name,
                    description: elem.description,
                    actions: <>
                        <Button style={{ margin: "5px" }}
                            key={"e" + elem.id}
                            onClick={() => {
                                setInputParameters(mapToInput(elem))
                                setShowForm(ShowForm.Update)
                            }}
                        ><EditOutlined  />
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
                        deleteDoctorTypeMutation({
                            variables: {
                                id: deleteId!
                            },
                            update: (store) => {
                                store.writeQuery({
                                    query: SearchDoctorTypeDocument,
                                    variables: { searchStr },
                                    data: {
                                        searchDoctorType: {
                                            elems: doctortypeList!.filter(x => x.id !== deleteId)
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
                            setInputParameters(inputParametersDefault)
                            setShowForm(ShowForm.Create)
                        }}>
                        <PlusOutlined  ></PlusOutlined>
                    </Button>
                </Col>
                <Col span="4">
                    <Search defaultValue={searchStr} onSearch={(value) => setSearchStr(value)} />
                </Col>
            </Row>


            <Modal visible={showForm != ShowForm.None}
                onCancel={() => setShowForm(ShowForm.None)}
                onOk={() => {
                    if (showForm == ShowForm.Create) {
//                        if (!(inputParameters.isUnplanned)) inputParameters.isUnplanned = false
                        createDoctorTypeMutation({
                            variables: inputParameters as _CreateDoctorTypeInput,
                            update: (store, result) => {
                                store.writeQuery({
                                    query: SearchDoctorTypeDocument,
                                    variables: { searchStr },
                                    data: {
                                        searchDoctorType: {
                                            elems: [, ...doctortypeList!, result.data?.dictionaryPacket?.updateOrCreateDoctorType?.returning]
                                        }
                                    }
                                })
                            }
                        })
                    } else if (showForm == ShowForm.Update) {
                        updateDoctorTypeMutation({ variables: inputParameters as _CreateDoctorTypeInput })
                    }
                }}
            >
                <Form>
                    <Form.Item label="Id (code)" required>
                        <Input readOnly={showForm == ShowForm.Update}
                            value={inputParameters.id!}
                            onChange={(e: { target: { value: any; }; }) => changeInputParameters({ id: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Name" required>
                        <Input
                            value={inputParameters.name!}
                            onChange={(e: { target: { value: any; }; }) => changeInputParameters({ name: e.target.value })}
                        />
                    </Form.Item>
                </Form>

            </Modal>
            <Table
                columns={columns}
                dataSource={mapToView(doctortypeList)}
            />
        </>

    )
}