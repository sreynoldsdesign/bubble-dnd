function Header({path}) {
    return (
        <header className="app-header">
            <h1>Bubble DnD</h1>
            <div>
                {path.map((node,index) => (
                    <span key={node.id}>
                        {node.name}
                        {index < path.length -1 && " > "}
                    </span>
                ))}
            </div>
        </header>
    );
}

export default Header;