import { useState } from "react";
import Graph from "react-graph-vis";
import { v4 as uuidv4 } from "uuid";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import logo from "../assets/image.png";

// Graph options
const options = {
  layout: {
    hierarchical: {
      enabled: false,
    },
  },
  edges: {
    color: "#ABABAB",
  },
  nodes: {
    color: "#BBBBBB",
  },
  physics: {
    enabled: false,
  },
  interaction: { multiselect: false, dragView: false },
};

// Default graph data
const defaultGraph = {
  nodes: [{ id: 1, label: "Start", title: null }],
  edges: [],
};

export default function Home() {
  const [graphData, setGraphData] = useState(defaultGraph);
  const [firstNode, setFirstNode] = useState(1);
  const [secondNode, setSecondNode] = useState(1);
  const [inputString, setInputString] = useState("");

  const addNewState = (accptingState) => {
    let newGraph = JSON.parse(JSON.stringify(graphData));
    const ids = newGraph.nodes.map((x) => x.id);
    const newId = Math.max(...ids) + 1;
    newGraph.nodes.push(
      accptingState
        ? {
            id: newId,
            label: `Q${newId}`,
            borderWidth: 3,
            color: { border: "#000000" },
            title: "accepting",
          }
        : { id: newId, label: `Q${newId}`, title: null }
    );
    setGraphData(newGraph);
  };

  const addEdge = (nodeId1, nodeId2, label = "0") => {
    let newGraph = JSON.parse(JSON.stringify(graphData));

    // Check if edge exists already
    const existingEdge = newGraph.edges.find(
      (x) => x.from === parseInt(nodeId1) && x.to === parseInt(nodeId2)
    );
    const existingOutTransition = newGraph.edges.find(
      (x) => x.from === parseInt(nodeId1) && x.label.includes(label)
    );

    if (existingEdge) {
      if (existingEdge.label !== label) {
        existingEdge.label = "0, 1";
      }
      // Check if edge with same value originates from this node already
    } else if (existingOutTransition) {
      const fromNode = newGraph.nodes.find((x) => x.id === nodeId1);
      alert(`${fromNode.label} has a transition with value ${label} already`);
      // otherwise add new edge
    } else {
      newGraph.edges.push({
        from: parseInt(nodeId1),
        to: parseInt(nodeId2),
        label: label,
        smooth: { enabled: true, type: "curvedCW", roundness: 1 },
      });
    }
    setGraphData(newGraph);
  };

  const handleState1Change = (event) => {
    setFirstNode(event.target.value);
  };

  const handleState2Change = (event) => {
    setSecondNode(event.target.value);
  };

  const resetGraph = () => {
    setGraphData(defaultGraph);
  };

  // Allow only binary strings
  const handleStringInput = (e) =>
    e.target.value.match(/(^[01]+$|^$)/g) && setInputString(e.target.value);

  const checkInputString = () => {
    const currNodeId = 1;

    // Check if input string isn't empty
    const accepted = inputString.length > 0;

    // traverse automata according to input
    [...inputString].forEach((value, idx) => {
      let nextEdge = graphData.edges.find(
        (x) => x.from === currNodeId && x.label.includes(value)
      );
      if (nextEdge) {
        currNodeId = nextEdge.to;

        // Check if last state is accepting state
        if (idx === inputString.length - 1) {
          const currNodeObj = graphData.nodes.find((x) => x.id === currNodeId);
          accepted = !!currNodeObj.title && currNodeObj.title === "accepting";
        }

        return;
      } else {
        accepted = false;
      }
    });

    alert(accepted ? "String accepted" : "String not accepted");
  };

  const makeStartStateAccepting = () => {
    let newGraph = JSON.parse(JSON.stringify(graphData));
    const startNode = newGraph.nodes.find((x) => x.id === 1);
    startNode.borderWidth = 3;
    startNode.color = { border: "#000000" };
    startNode.title = "accepting";

    setGraphData(newGraph);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>DFA visualizer</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div>
          <img src={logo} />
        </div>
        <h1 className="m-5">DFA visualization tool</h1>

        <div style={{ width: "80vw" }}>
          <div className="form-group">
            <button className="btn btn-secondary m-2" onClick={resetGraph}>
              Reset DFA
            </button>

            <button
              className="btn btn-secondary m-2"
              onClick={() => addNewState()}
            >
              Add new state
            </button>
            <button
              className="btn btn-secondary m-2"
              onClick={() => addNewState(true)}
            >
              Add new accepting state
            </button>

            <button
              className="btn btn-secondary m-2"
              onClick={() => makeStartStateAccepting()}
            >
              Make start state accepting
            </button>
          </div>

          <div className="row">
            <div className="form-group col-sm-3 m-2">
              <label>Pick state 1:</label>
              <select
                value={firstNode}
                className="form-control"
                onChange={handleState1Change}
              >
                {graphData.nodes.map((node) => (
                  <option key={uuidv4()} value={node.id}>
                    {node.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-sm-3 m-2">
              <label>Pick state 2:</label>
              <select
                value={secondNode}
                className="form-control"
                onChange={handleState2Change}
              >
                {graphData.nodes.map((node) => (
                  <option key={uuidv4()} value={node.id}>
                    {node.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-sm-3 m-2 d-flex">
              <div
                className="btn-group align-self-end"
                role="group"
                aria-label="Add edge"
              >
                <input
                  type="button"
                  className="btn btn-primary"
                  onClick={() => addEdge(firstNode, secondNode)}
                  value="Add 0 transition"
                />
                <input
                  type="button"
                  className="btn btn-primary"
                  onClick={() => addEdge(firstNode, secondNode, "1")}
                  value="Add 1 transition"
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="form-group col-sm-6 m-2">
              <label>Binary input string: </label>
              <input
                type="text"
                value={inputString}
                className="form-control"
                onChange={handleStringInput}
                placeholder="Input string..."
              />
            </div>
            <div className="form-group col-sm-4 d-flex m-2">
              <input
                type="button"
                onClick={checkInputString}
                className="btn btn-success align-self-end"
                value="Check string"
              />
            </div>
          </div>
        </div>

        <div style={{ height: "50vh", width: "80vw", border: "1px solid" }}>
          <Graph key={uuidv4()} graph={graphData} options={options} />
        </div>
      </main>
      <footer className="bg-light text-center text-lg-start">
        <div
          className="text-center p-3"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          // style="background-color: rgba(0, 0, 0, 0.2);"
        >
          <div className="row fw-bold fs-5">
            <div className="col text-center">Created By-</div>
          </div>
          <div className="row fw-bold">
            <div className="col">Akshat Khare - 1RV19CS009</div>
            <div className="col">Aryan Agarwal - 1RV19CS023</div>
            <div className="col">Divyang Mishra - 1RV19CS046</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
