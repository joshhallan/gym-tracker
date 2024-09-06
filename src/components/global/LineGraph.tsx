import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const LineGraph = ({ data }) => {
  return (
    <div>
      {data[0].error === "No data" ? (
        <h6>No historical data available</h6>
      ) : (
        <ResponsiveContainer width={'99%'} height={300}>
          <LineChart width={600} height={300} data={data}>
            <Line type="monotone" dataKey="y" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="x"/>
            <YAxis label={{ value: 'Weight', angle: -90, position: 'insideLeft' }}/>
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LineGraph;
