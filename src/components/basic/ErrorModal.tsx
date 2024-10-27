import React from 'react';
import { Button, Modal } from 'antd';
interface Props {
    error: Error,
    setError: (value: Error | null) => void
}
const ErrorModal: React.FC<Props> = ({ error, setError }) => {

    return (
        <>
            <Modal footer={null} visible={true} onCancel={() => setError(null)}>
                {error.message}
            </Modal>
        </>
    )

};
export default ErrorModal;