const Person = ({ person, onDelete }) => (
  <div>
    {person.name} {person.number}{' '}
    <button onClick={onDelete}>delete</button>
  </div>
)

export default Person
