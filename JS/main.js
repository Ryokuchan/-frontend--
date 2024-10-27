fetch('https://smapi.pv-api.sbc.space/ds-7429590172239724545/graphql')
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