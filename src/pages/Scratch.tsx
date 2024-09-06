import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";

const LineGraph = ({ data }) => {
  // console.log(data);

  const chartData = {
    x: data.map(item => new Date(item.x).toLocaleDateString()),
    y: item.y
  }

  console.log(chartData)

  const stubData = [
    { name: "Page A", uv: 400, pv: 2400, amt: 2400 },
    { name: "Page B", uv: 300, pv: 2400, amt: 2400 },
    { name: "Page c", uv: 200, pv: 2400, amt: 2400 },
  ];

  return (
    <div>
      {data.error ? (
        <h2>Sorry no data available</h2>
      ) : (
        // <ResponsiveContainer width={700} height="80%">
          <LineChart width={600} height={300} data={data}>
            <Line type="monotone" dataKey="y" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="x" />
            <YAxis />
          </LineChart>
        // </ResponsiveContainer>
      )}
    </div>
  );
};

export default LineGraph;
