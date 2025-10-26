"use client"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ChartData {
    week: string;
    products: number;
}

const ProductCharts = ({data}: {data: ChartData[]}) => {
    console.log(data);
  return (
    <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{top: 5, right: 3, left: 20, bottom: 5}}>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="#8884d8" fontSize={12}/>
                <YAxis stroke="#8884d8" fontSize={12} allowDecimals={false}/>
                <Area type="monotone" dataKey="products" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                <Tooltip />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  )
}

export default ProductCharts