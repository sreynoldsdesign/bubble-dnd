function Header({path, goToNode}) {
    return (
        <header className="app-header">
            <div className="header-center">
                <h1>Bubble D&D</h1>
            </div>
            <div className="header-path">
                {path.map((node,index) => (
                    <span key={node.id}>
                        <span className={`breadcrumb-item ${ index=== path.length - 1 ? "active" : ""}`} onClick={(e) => {e.stopPropagation(); goToNode(node.id)}}>
                            {node.name}
                        </span>

                        {index < path.length - 1 && " > "}
                    </span>
                ))}
            </div>
        </header>
    );
}

export default Header;