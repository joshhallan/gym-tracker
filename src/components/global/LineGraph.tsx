import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const LineGraph = ({ data }) => {
  console.log(data);
  return (
    <ResponsiveContainer width={"99%"} height={300}>
      <LineChart width={600} height={300} data={data}>
        <Line type="monotone" dataKey="y" stroke="#8884d8" />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="x" />
        <YAxis
          label={{ value: "Weight", angle: -90, position: "insideLeft" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineGraph;
