function Header({path}) {
    return (
        <header className="app-header">
            <div className="header-center">
                <h1>Bubble D&D</h1>
            </div>
            <div className="header-path">
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